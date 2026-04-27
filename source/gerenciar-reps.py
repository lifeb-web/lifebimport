#!/usr/bin/env python3
"""
Gerenciador de Representantes — Life B
Adiciona ou remove reps do sistema completo automaticamente.

Como usar:
  python3 gerenciar-reps.py
"""

import os, re, secrets, subprocess, unicodedata

DROPBOX    = "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR"
WORKTREE   = "/tmp/ghpages-hist2"
REPO       = "/Users/robertmarques/Desktop/lifebimport-jlbv"
TEMPLATE   = os.path.join(DROPBOX, "painel reps", "dashboard-rep-template.html")
PROXY_GS   = os.path.join(DROPBOX, "lifeb-leads-proxy.gs")
PLANILHA   = os.path.join(DROPBOX, "planilha-leads-script.gs")
BASE_URL   = "https://projetojlbv.com.br/rep/dash/"

def to_slug(name):
    nfkd = unicodedata.normalize('NFKD', name)
    ascii_ = nfkd.encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-z0-9]+', '-', ascii_.lower()).strip('-')

def to_key(name):
    return to_slug(name).upper().replace('-', '_')

def read(path):
    with open(path, 'r', encoding='utf-8') as f: return f.read()

def write(path, content):
    with open(path, 'w', encoding='utf-8') as f: f.write(content)

def ensure_worktree():
    if not os.path.isdir(WORKTREE):
        print("  Worktree ausente — recriando...")
        subprocess.run(['git', 'worktree', 'prune'], cwd=REPO, check=True)
        subprocess.run(['git', 'worktree', 'add', WORKTREE, 'gh-pages'], cwd=REPO, check=True)
    subprocess.run(['git', 'pull', 'origin', 'gh-pages', '--quiet'], cwd=WORKTREE, check=True)
    print("  ✓ Worktree atualizado")

def list_reps():
    content = read(PROXY_GS)
    block = re.search(r'const REP_TOKENS\s*=\s*\{([^}]+)\}', content)
    if not block: return []
    return re.findall(r"'([^']+)':\s*'([^']+)'", block.group(1))

# ── ADICIONAR ─────────────────────────────────────────────────
def add_rep():
    print("\n─── ADICIONAR REP ───")
    display = input("Nome do rep (ex: João Silva): ").strip()
    if not display:
        print("Nome inválido."); return

    slug  = to_slug(display)
    key   = to_key(display)
    token = secrets.token_hex(14)
    url   = BASE_URL + slug + "/"

    print(f"\n  Nome exibido:       {display}")
    print(f"  Chave na planilha:  {key}")
    print(f"  URL do painel:      {url}")
    if input("\n  Confirma? (s/n): ").strip().lower() != 's':
        print("  Cancelado."); return

    # 1. Worktree
    print("\n[1/6] Atualizando worktree...")
    ensure_worktree()

    # 2. Proxy
    print("[2/6] Atualizando proxy...")
    proxy = read(PROXY_GS)
    if f"'{key}'" in proxy:
        print(f"  ⚠️  {key} já existe no proxy — pulando")
    else:
        proxy = re.sub(r'(\};)', f"  '{key}': '{token}',\n\\1", proxy, count=1)
        write(PROXY_GS, proxy)
        print(f"  ✓ {key} adicionado")

    # 3. Script da planilha
    print("[3/6] Atualizando planilha-leads-script.gs...")
    pl = read(PLANILHA)
    if f"'{key}'" in pl:
        print(f"  ⚠️  {key} já existe no script — pulando")
    else:
        pl = re.sub(
            r"(var REP_URLS\s*=\s*\{[^}]+?)(\s*\};)",
            lambda m: m.group(1) + f"\n      '{key}': '{url}'," + m.group(2),
            pl, count=1
        )
        write(PLANILHA, pl)
        print(f"  ✓ {key} adicionado")

    # 4. Gerar painel
    print("[4/6] Gerando painel...")
    tpl  = read(TEMPLATE)
    html = tpl.replace('__REP_NAME__', key).replace('__REP_TOKEN__', token).replace('__REP_DISPLAY__', display)
    bad  = [p for p in ['__REP_NAME__','__REP_TOKEN__','__REP_DISPLAY__','__LOGO_SRC__'] if p in html]
    if bad:
        print(f"  ❌ Placeholders restantes: {bad}"); return
    panel_dir  = os.path.join(WORKTREE, "rep", "dash", slug)
    panel_file = os.path.join(panel_dir, "index.html")
    os.makedirs(panel_dir, exist_ok=True)
    write(panel_file, html)
    print(f"  ✓ Gerado: {panel_file}")

    # 5. Deploy
    print("[5/6] Deploy (git commit + push)...")
    subprocess.run(['git', 'add', panel_file], cwd=WORKTREE, check=True)
    msg = f"feat: painel rep {display}\n\nURL: /rep/dash/{slug}/\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
    subprocess.run(['git', '-c', 'core.logAllRefUpdates=false', 'commit', '-m', msg], cwd=WORKTREE, check=True)
    subprocess.run(['git', 'push', 'origin', 'gh-pages'], cwd=WORKTREE, check=True)
    print("  ✓ Live no GitHub Pages")

    # 6. Dropbox
    print("[6/6] Sincronizando Dropbox...")
    dropbox_file = os.path.join(DROPBOX, "painel reps", f"dashboard-rep-{slug}.html")
    write(dropbox_file, html)
    print(f"  ✓ {dropbox_file}")

    print(f"""
╔══════════════════════════════════════════╗
  ✅  REP CRIADO COM SUCESSO!
╚══════════════════════════════════════════╝

  URL do painel : {url}
  Coluna G      : {key}

  VOCÊ AINDA PRECISA FAZER:
  1. Reimplantar o PROXY no Apps Script (nova versão)
  2. Colar planilha-leads-script.gs no Apps Script da planilha e salvar
""")

# ── REMOVER ───────────────────────────────────────────────────
def remove_rep():
    print("\n─── REMOVER REP ───")
    reps = list_reps()
    if not reps:
        print("Nenhum rep encontrado."); return

    print("\nReps disponíveis:")
    for i, (key, _) in enumerate(reps):
        print(f"  {i+1}. {key}")

    try:
        idx = int(input("\nNúmero do rep a remover: ").strip()) - 1
        key, _ = reps[idx]
    except:
        print("Opção inválida."); return

    slug = key.lower().replace('_', '-')
    print(f"\n  Removendo: {key}  →  /rep/dash/{slug}/")
    if input("  Confirma? (s/n): ").strip().lower() != 's':
        print("  Cancelado."); return

    # 1. Worktree
    print("\n[1/6] Atualizando worktree...")
    ensure_worktree()

    # 2. Proxy
    print("[2/6] Removendo do proxy...")
    proxy = read(PROXY_GS)
    proxy = re.sub(r"\n?\s*'" + re.escape(key) + r"':\s*'[^']*',?", '', proxy)
    write(PROXY_GS, proxy)
    print(f"  ✓ {key} removido")

    # 3. Script da planilha
    print("[3/6] Removendo do planilha-leads-script.gs...")
    pl = read(PLANILHA)
    pl = re.sub(r"\n?\s*'" + re.escape(key) + r"':\s*'[^']*',?", '', pl)
    write(PLANILHA, pl)
    print(f"  ✓ {key} removido")

    # 4. Remover painel do worktree
    print("[4/6] Removendo painel do worktree...")
    panel_dir = os.path.join(WORKTREE, "rep", "dash", slug)
    if os.path.isdir(panel_dir):
        subprocess.run(['git', 'rm', '-rf', panel_dir], cwd=WORKTREE, check=True)
        print(f"  ✓ Removido: {panel_dir}")
    else:
        print(f"  ⚠️  Pasta não encontrada — pulando")

    # 5. Deploy
    print("[5/6] Deploy...")
    msg = f"feat: remover painel rep {key}\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
    subprocess.run(['git', '-c', 'core.logAllRefUpdates=false', 'commit', '-m', msg], cwd=WORKTREE, check=True)
    subprocess.run(['git', 'push', 'origin', 'gh-pages'], cwd=WORKTREE, check=True)
    print("  ✓ Removido do GitHub Pages")

    # 6. Dropbox
    print("[6/6] Removendo do Dropbox...")
    dropbox_file = os.path.join(DROPBOX, "painel reps", f"dashboard-rep-{slug}.html")
    if os.path.exists(dropbox_file):
        os.remove(dropbox_file)
        print(f"  ✓ {dropbox_file} removido")

    print(f"""
╔══════════════════════════════════════════╗
  ✅  REP REMOVIDO COM SUCESSO!
╚══════════════════════════════════════════╝

  VOCÊ AINDA PRECISA FAZER:
  1. Reimplantar o PROXY no Apps Script (nova versão)
  2. Colar planilha-leads-script.gs no Apps Script da planilha e salvar
""")

# ── MENU ──────────────────────────────────────────────────────
def main():
    print("═══════════════════════════════════════")
    print("   Gerenciador de Reps — Life B")
    print("═══════════════════════════════════════")
    reps = list_reps()
    print(f"\n   Reps ativos: {len(reps)}")
    for key, _ in reps:
        print(f"   · {key}")
    print("\n   1. Adicionar rep")
    print("   2. Remover rep")
    print("   3. Sair")
    choice = input("\n   Opção: ").strip()
    if choice == '1':   add_rep()
    elif choice == '2': remove_rep()
    else: print("Saindo.")

if __name__ == '__main__':
    main()
