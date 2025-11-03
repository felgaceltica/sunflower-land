# TrazerNovosArquivos.ps1
param(
  [int]$TamanhoLote = 75,
  [string]$Fonte = "sunflower-land/main",
  [string]$Mensagem = "Trazendo arquivos novos do upstream",
  [switch]$NoVerify
)

# 1) Atualiza o remoto 'upstream'
git fetch upstream | Out-Null

# 2) Lista somente arquivos ADICIONADOS no $Fonte em relação ao seu HEAD
$arquivos = git diff --name-only --diff-filter=A HEAD..$Fonte | Where-Object { $_ -ne "" }

if (-not $arquivos -or $arquivos.Count -eq 0) {
  Write-Host "Nenhum arquivo 'novo no upstream' encontrado."
  exit 0
}

# 2.1) Filtra apenas os que realmente existem na árvore do $Fonte
$validos = New-Object System.Collections.Generic.List[string]
foreach ($p in $arquivos) {
  $spec = "${Fonte}:$p"   # <-- evita o erro do ':'
  git cat-file -e -- $spec 2>$null
  if ($LASTEXITCODE -eq 0) { $validos.Add($p) }
}

$Total = $validos.Count
Write-Host "Arquivos novos encontrados (válidos no $Fonte): $Total"
if ($Total -eq 0) { exit 0 }

# 3) Restaura e commita em lotes, usando --pathspec-from-file (sem ENAMETOOLONG)
$parte = 0
for ($i = 0; $i -lt $Total; $i += $TamanhoLote) {
  $parte++
  $fim  = [Math]::Min($i + $TamanhoLote - 1, $Total - 1)
  $lote = $validos[$i..$fim]

  Write-Host "-> Lote ${parte}: arquivos $($i+1) .. $($fim+1)"

  # Cria arquivo temporário UTF-8 sem BOM
  $tmp = [System.IO.Path]::GetTempFileName()
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllLines($tmp, $lote, $utf8NoBom)

  # Restaura do $Fonte para stage + worktree
  git restore --source=$Fonte --staged --worktree --pathspec-from-file="$tmp"
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Falha ao restaurar algum arquivo do lote $parte. Tentando arquivo a arquivo..."
    foreach ($p in $lote) {
      git restore --source=$Fonte --staged --worktree -- "$p"
    }
  }

  # Commit
  if ($NoVerify) { git commit -m "$Mensagem (parte $parte)" --no-verify }
  else           { git commit -m "$Mensagem (parte $parte)" }

  Remove-Item $tmp -ErrorAction SilentlyContinue
}

Write-Host "Concluído: $parte commit(s)."
