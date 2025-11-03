param(
  [int]$TamanhoLote = 75,
  [string]$Mensagem = "Commit em lotes",
  [switch]$NoVerify # use -NoVerify para pular Husky/lint-staged
)

function Get-FilesToCommit {
  # Modificados
  $mod = git diff --name-only
  # Deletados
  $del = git ls-files -d
  # Não rastreados
  $untracked = git ls-files --others --exclude-standard
  @($mod + $del + $untracked | Where-Object { $_ -and (Test-Path $_ -PathType Leaf -ErrorAction SilentlyContinue) -or ($del -contains $_) } | Select-Object -Unique)
}

# 1) Garante que nada esteja staged (NÃO altera conteúdo do working tree)
git reset

# 2) Coleta a lista atualizada de arquivos
$arquivos = Get-FilesToCommit
if (-not $arquivos -or $arquivos.Count -eq 0) {
  Write-Host "Nenhum arquivo pendente para commit."
  exit 0
}

$total = $arquivos.Count
Write-Host "Total de arquivos a comitar: $total"

$parte = 0
for ($i = 0; $i -lt $total; $i += $TamanhoLote) {
  $parte++
  $inicio = $i
  $fim = [Math]::Min($i + $TamanhoLote - 1, $total - 1)
  $lote = $arquivos[$inicio..$fim]

  Write-Host "-> Lote $parte: arquivos $($inicio+1) a $($fim+1)"

  # 3) Stage somente o lote atual (usa -- para lidar com nomes com espaços)
  git add -- $lote

  # 4) Commita o lote (com opção de pular hooks)
  $msg = "$Mensagem (parte $parte)"
  if ($NoVerify) {
    git commit -m $msg --no-verify
  } else {
    git commit -m $msg
  }
}

Write-Host "Concluído: $parte commit(s) criados."
