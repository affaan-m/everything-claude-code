# Agent Orkestrasyonu

## Mevcut Agent'lar

`~/.claude/agents/` dizininde bulunur:

| Agent | Amaç | Ne Zaman Kullanılır |
|-------|---------|-------------|
| planner | Uygulama planlaması | Karmaşık özellikler, refactoring |
| architect | Sistem tasarımı | Mimari kararlar |
| tdd-guide | Test odaklı geliştirme | Yeni özellikler, hata düzeltmeleri |
| code-reviewer | Kod incelemesi | Kod yazdıktan sonra |
| security-reviewer | Güvenlik analizi | Commit'lerden önce |
| build-error-resolver | Build hatalarını düzeltme | Build başarısız olduğunda |
| e2e-runner | E2E testleri | Kritik kullanıcı akışları |
| refactor-cleaner | Ölü kod temizliği | Kod bakımı |
| doc-updater | Dokümantasyon | Dokümanları güncelleme |
| rust-reviewer | Rust kod incelemesi | Rust projeleri |

## Anlık Agent Kullanımı

Kullanıcı istemi gerekmez:
1. Karmaşık özellik istekleri - **planner** agent kullan
2. Kod yeni yazıldı/değiştirildi - **code-reviewer** agent kullan
3. Hata düzeltmesi veya yeni özellik - **tdd-guide** agent kullan
4. Mimari karar - **architect** agent kullan

## Paralel Görev Yürütme

Bağımsız işlemler için DAIMA paralel Task yürütme kullan:

```markdown
# İYİ: Paralel yürütme
3 agent'ı paralel başlat:
1. Agent 1: Auth modülü güvenlik analizi
2. Agent 2: Cache sistemi performans incelemesi
3. Agent 3: Utilities tip kontrolü

# KÖTÜ: Gereksiz sıralı yürütme
Önce agent 1, sonra agent 2, sonra agent 3
```

## Çok Perspektifli Analiz

Karmaşık problemler için split role sub-agent'lar kullan:
- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
