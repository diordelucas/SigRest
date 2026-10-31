# Deploy do SIGREST na Oracle Cloud (VM Always Free)

O sistema roda numa máquina virtual gratuita da Oracle, com o mesmo Docker Compose usado no desenvolvimento, só que na versão de produção ([docker-compose.prod.yml](docker-compose.prod.yml)):

```
Internet ──HTTPS──► Caddy ─┬─ /        ─► nginx (build do React)
 (80/443)                  └─ /api/*   ─► Spring Boot ─► PostgreSQL (rede interna, sem porta exposta)
```

- **HTTPS automático**: o Caddy emite e renova sozinho o certificado do Let's Encrypt para o domínio.
- **Frontend e API no mesmo domínio** (`/api`), então não há CORS para configurar.
- **Segredos aleatórios** gerados na própria VM (`.env.prod`); o backend se recusa a subir com senhas de desenvolvimento.
- **Backup diário** do banco às 03:00, guardando 30 dias.
- **Deploy automático**: cada merge na `main` roda os testes e, se passarem, atualiza a VM.

---

## 1. Criar a conta na Oracle Cloud

1. Acesse [cloud.oracle.com](https://cloud.oracle.com) e clique em **Start for free**.
2. O cadastro pede um cartão de crédito só para verificação. Os recursos *Always Free* não são cobrados.
3. A **região principal (home region) não pode ser trocada depois**. Escolha **Brazil East (São Paulo)** ou **Brazil Southeast (Vinhedo)**.

## 2. Criar a VM

1. Menu ☰ → **Compute → Instances → Create instance**.
2. **Image**: *Canonical Ubuntu 22.04* (ou 24.04).
3. **Shape**: *Ampere* → **VM.Standard.A1.Flex**, com **2 OCPUs e 12 GB de memória**, o limite total do plano gratuito. Não passe disso: ao fim do período de teste, VMs acima do limite são desativadas e apagadas depois de 30 dias.
4. **Networking**: deixe criar uma VCN nova com sub-rede pública e marque **Assign a public IPv4 address**.
5. **Add SSH keys**: *Upload public key files* → selecione `C:\Users\georg\.ssh\sigrest_oracle.pub`. A chave já foi gerada neste computador; a parte privada fica só aqui.
6. **Create**. Quando a VM estiver *Running*, copie o **Public IP address**.

> **"Out of capacity"?** As VMs ARM gratuitas às vezes esgotam na região. Se a tela mostrar outro *Availability Domain*, tente nele. Em São Paulo só existe o AD 1: peça menos recursos (**1 OCPU e 6 GB**), não escolha *Fault domain* e tente de novo em outros horários. A outra saída indicada pela Oracle é o upgrade para *Pay As You Go*: os recursos *Always Free* continuam gratuitos, mas o que passar do limite é cobrado no cartão.

## 3. Abrir as portas 80 e 443 na rede da Oracle

Na página da VM: **Subnet** → **Security Lists** → *Default Security List* → **Add Ingress Rules**, uma regra para cada porta:

| Source CIDR | IP Protocol | Destination Port Range |
|---|---|---|
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |

O firewall de dentro da VM (iptables) é liberado pelo script do passo 5.

## 4. Domínio gratuito (DuckDNS)

O HTTPS precisa de um domínio apontando para o IP da VM.

1. Entre em [duckdns.org](https://www.duckdns.org) com sua conta Google ou GitHub.
2. Crie um subdomínio (ex.: `majus-sigrest`) e, em *current ip*, coloque o **IP da VM** → **update ip**.
3. O endereço do sistema será `https://majus-sigrest.duckdns.org`.

Se tiver um domínio próprio, crie nele um registro **A** apontando para o IP da VM.

## 5. Instalar o SIGREST na VM

No terminal do seu computador:

```bash
ssh -i ~/.ssh/sigrest_oracle ubuntu@IP_DA_VM
```

Já dentro da VM:

```bash
git clone https://github.com/diordelucas/SigRest.git
cd SigRest
SITE_DOMAIN=majus-sigrest.duckdns.org ADMIN_EMAIL=seu@email.com bash deploy/setup-vm.sh
```

O [setup-vm.sh](deploy/setup-vm.sh) instala o Docker, libera as portas 80/443 no iptables, ajusta o fuso horário, cria 2 GB de swap, gera o `.env.prod` com senhas aleatórias e agenda o backup diário. **Anote o e-mail e a senha do administrador que ele mostra no final.** Eles também ficam no `.env.prod`: `grep ADMIN_ .env.prod`.

Saia e entre de novo no SSH, para o grupo `docker` passar a valer, e suba o sistema:

```bash
exit
ssh -i ~/.ssh/sigrest_oracle ubuntu@IP_DA_VM
cd SigRest && bash deploy/deploy.sh
```

O primeiro build leva alguns minutos. Depois, acesse `https://SEU_DOMINIO`, entre com o administrador e **troque a senha** no ícone de usuário, no canto superior direito (*Alterar senha*).

## 6. Atualizar o sistema

- **Automático** (recomendado): configure o passo 7. Todo merge na `main` atualiza a VM sozinho.
- **Manual**: na VM, `cd SigRest && bash deploy/deploy.sh`. Ele baixa o código novo e reconstrói só o que mudou.

## 7. Deploy automático (GitHub Actions)

O workflow [ci-deploy.yml](.github/workflows/ci-deploy.yml) roda os testes do backend e a checagem do frontend em todo push e pull request. Num push na `main`, se tudo passar, ele entra na VM por SSH e roda o `deploy.sh`.

No GitHub: **Settings → Secrets and variables → Actions**:

| Tipo | Nome | Valor |
|---|---|---|
| Secret | `VM_HOST` | IP da VM |
| Secret | `VM_USER` | `ubuntu` |
| Secret | `VM_SSH_KEY` | conteúdo inteiro do arquivo `C:\Users\georg\.ssh\sigrest_oracle` (a chave **privada**, sem `.pub`) |
| Variable | `DEPLOY_ENABLED` | `true` |

Enquanto `DEPLOY_ENABLED` não existir, o workflow só roda os testes.

## 8. Backups

- Todo dia às 03:00 o [backup.sh](deploy/backup.sh) salva `backups/sigrest_AAAAMMDD_HHMM.sql.gz` na VM e apaga os com mais de 30 dias.
- Os backups ficam no disco da própria VM. De tempos em tempos, copie-os para fora dela:
  `scp -i ~/.ssh/sigrest_oracle "ubuntu@IP_DA_VM:SigRest/backups/*.gz" .`
- Para restaurar, veja o comentário no topo do [backup.sh](deploy/backup.sh).

## Comandos úteis (na VM, dentro de `SigRest/`)

```bash
# Situação dos containers
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
# Logs da API (Ctrl+C para sair)
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f backend
# Logs do HTTPS (certificado)
docker compose -f docker-compose.prod.yml --env-file .env.prod logs caddy
```

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| O site não abre (timeout) | Portas 80/443 fechadas na Security List (passo 3) ou o domínio não aponta para o IP da VM (passo 4). |
| Erro de certificado / HTTPS | Mesmas causas acima: o Let's Encrypt precisa alcançar a porta 80 pelo domínio. Veja os logs do `caddy`. |
| Backend reinicia sem parar, "segredos de desenvolvimento" no log | O `.env.prod` ainda tem algum `TROCAR` ou senha padrão. |
| Página antiga depois de um deploy | O navegador guardou a versão anterior (PWA): recarregue com Ctrl+F5. |
