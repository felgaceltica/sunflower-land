# CommitEmLotes.ps1
param(
    [int]$TamanhoLote = 50,
    [string]$Mensagem = "Commit em lotes"
)

# Lista de arquivos modificados (staged + unstaged)
$arquivos = git status --porcelain | ForEach-Object {
    $_.Substring(3)
}

$total = $arquivos.Count
if ($total -eq 0) {
    Write-Host "Nenhum arquivo modificado encontrado."
    exit
}

Write-Host "Total de arquivos: $total"
for ($i = 0; $i -lt $total; $i += $TamanhoLote) {
    $lote = $arquivos[$i..([math]::Min($i + $TamanhoLote - 1, $total - 1))]
    Write-Host "Commitando arquivos $($i + 1) até $([math]::Min($i + $TamanhoLote, $total))..."

    git add $lote
    git commit -m "$Mensagem (parte $([math]::Ceiling(($i + 1) / $TamanhoLote)))"
}
