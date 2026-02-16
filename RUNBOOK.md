# Portfolio Runbook — suryayelagam.me

## Infrastructure Overview

| Resource | Value |
|---|---|
| Domain | `suryayelagam.me` |
| Registrar | Route 53 (Gandi backend for .me TLD) |
| S3 Bucket | `suryayelagam.me` |
| CloudFront Distribution | `E133T8E2G04K4D` |
| CloudFront Domain | `d263dm352zvoh9.cloudfront.net` |
| Route 53 Hosted Zone | `Z0537983T1CVPJ5APJIK` |
| ACM Certificate | `arn:aws:acm:us-east-1:519173346937:certificate/202ad4e8-bfc1-4ce4-8c10-fcdca25ab54b` |
| AWS Account | `519173346937` |
| GitHub Repo | `https://github.com/suryayelagam/portfolio` |
| Estimated Monthly Cost | ~$0.50/mo |

## Architecture

```
Browser → CloudFront (HTTPS) → S3 (static website hosting)
                ↑
         ACM SSL Certificate
                ↑
     Route 53 A record (alias to CloudFront)
```

- **S3** hosts the static files (HTML, CSS, JS, SVG)
- **CloudFront** serves as the CDN with HTTPS termination
- **Route 53** manages DNS, pointing `suryayelagam.me` to CloudFront
- **ACM** provides the SSL certificate (auto-renews via DNS validation)

## Project Structure

```
portfolio/
├── index.html          # Single-page HTML
├── favicon.svg         # Browser tab icon
├── css/
│   └── style.css       # All styles
├── js/
│   └── main.js         # Typewriter, scroll animations, smooth scroll
├── assets/             # (empty, for future images/resume)
├── .gitignore
└── RUNBOOK.md          # This file
```

## Common Tasks

### Deploy Changes

After editing files locally:

```bash
# 1. Upload to S3
aws s3 sync ./portfolio/ s3://suryayelagam.me/ \
  --delete \
  --exclude ".DS_Store" \
  --exclude ".git/*" \
  --exclude ".gitignore" \
  --exclude "RUNBOOK.md"

# 2. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E133T8E2G04K4D \
  --paths "/*"
```

Cache invalidation takes 1-2 minutes to propagate.

### Commit and Push to GitHub

```bash
cd /Users/suryayelagam/Documents/ClaudeCodeProjects/portfolio
git add index.html css/style.css js/main.js favicon.svg
git commit -m "Description of changes"
git push origin main
```

### Verify Deployment

```bash
# Check S3 bucket contents
aws s3 ls s3://suryayelagam.me/ --recursive

# Check CloudFront invalidation status
aws cloudfront get-invalidation \
  --distribution-id E133T8E2G04K4D \
  --id <INVALIDATION_ID>

# Test the site
curl -I https://suryayelagam.me
```

### Update a Single File

For a quick single-file update (no need to sync everything):

```bash
# Upload just the changed file
aws s3 cp ./portfolio/index.html s3://suryayelagam.me/index.html

# Invalidate just that file
aws cloudfront create-invalidation \
  --distribution-id E133T8E2G04K4D \
  --paths "/index.html"
```

## DNS Configuration

Current Route 53 records in hosted zone `Z0537983T1CVPJ5APJIK`:

| Type | Name | Value |
|---|---|---|
| A (Alias) | `suryayelagam.me` | `d263dm352zvoh9.cloudfront.net` (CloudFront hosted zone `Z2FDTNDATAQYW2`) |
| NS | `suryayelagam.me` | Route 53 nameservers |
| SOA | `suryayelagam.me` | Standard SOA record |
| CNAME | `_acm-validation...` | ACM DNS validation record (do not delete) |

**Important:** The ACM CNAME validation record must stay in Route 53 for automatic certificate renewal.

## SSL Certificate

- Certificate covers `suryayelagam.me` and `*.suryayelagam.me`
- Validated via DNS (CNAME record in Route 53)
- Auto-renews as long as the DNS validation CNAME exists
- CloudFront uses SNI with TLS 1.2 minimum (`TLSv1.2_2021` security policy)

To check certificate status:
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:519173346937:certificate/202ad4e8-bfc1-4ce4-8c10-fcdca25ab54b \
  --query 'Certificate.{Status:Status,NotAfter:NotAfter}'
```

## CloudFront Configuration

| Setting | Value |
|---|---|
| Price Class | `PriceClass_100` (US, Canada, Europe only) |
| Default Root Object | `index.html` |
| Viewer Protocol Policy | Redirect HTTP to HTTPS |
| SSL Support Method | SNI |
| Minimum TLS Version | TLSv1.2_2021 |
| Access Logging | Disabled |

To view full distribution config:
```bash
aws cloudfront get-distribution-config --id E133T8E2G04K4D
```

## Troubleshooting

### Site not loading / HTTPS errors

1. Check if CloudFront distribution is enabled:
   ```bash
   aws cloudfront get-distribution --id E133T8E2G04K4D \
     --query 'Distribution.{Status:Status,Enabled:DistributionConfig.Enabled}'
   ```

2. Verify DNS resolution:
   ```bash
   dig suryayelagam.me
   # Should return an A record pointing to CloudFront IPs
   ```

3. Check SSL certificate status:
   ```bash
   aws acm describe-certificate \
     --certificate-arn arn:aws:acm:us-east-1:519173346937:certificate/202ad4e8-bfc1-4ce4-8c10-fcdca25ab54b \
     --query 'Certificate.Status'
   # Should return "ISSUED"
   ```

### Changes not appearing after deploy

1. Confirm files were uploaded:
   ```bash
   aws s3 ls s3://suryayelagam.me/index.html
   ```

2. Create a new cache invalidation:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E133T8E2G04K4D \
     --paths "/*"
   ```

3. Wait 1-2 minutes, then hard-refresh the browser (Cmd+Shift+R on Mac).

### DNSSEC issues (SERVFAIL)

This was resolved previously. If it recurs:

1. Check if Route 53 has DNSSEC signing enabled:
   ```bash
   aws route53 get-dnssec --hosted-zone-id Z0537983T1CVPJ5APJIK
   ```

2. If `NOT_SIGNING` but a DS record exists at the registry, remove it:
   ```bash
   aws route53domains get-domain-detail --domain-name suryayelagam.me \
     --query 'DnssecKeys'
   ```

3. If stale DS records exist, disassociate them:
   ```bash
   aws route53domains disassociate-delegation-signer-from-domain \
     --domain-name suryayelagam.me \
     --id "<DELEGATION_SIGNER_ID>"
   ```

DS record removal from the .me TLD can take 30+ minutes to propagate.

## Cost Breakdown

| Service | Estimated Cost |
|---|---|
| Route 53 Hosted Zone | $0.50/mo |
| S3 Storage + Requests | < $0.01/mo |
| CloudFront (PriceClass_100) | < $0.01/mo (low traffic) |
| ACM Certificate | Free |
| Domain Renewal (suryayelagam.me) | ~$9/year |
| **Total** | **~$0.50/mo + $9/year domain** |

## Git Configuration

```
Repository: https://github.com/suryayelagam/portfolio
Branch: main
User: Surya Kiran Yelagam <suryayelagam@gmail.com>
```
