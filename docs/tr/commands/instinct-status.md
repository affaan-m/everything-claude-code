---
name: instinct-status
description: Öğrenilen içgüdüleri (proje + global) güven seviyesiyle göster
command: true
---

# Instinct Status Komutu

Mevcut proje için öğrenilen içgüdüleri ve global içgüdüleri, domain'e göre gruplandırılmış şekilde gösterir.

## Uygulama

Plugin root path kullanarak instinct CLI'ı çalıştır:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" status
```

Veya `CLAUDE_PLUGIN_ROOT` ayarlanmamışsa (manuel kurulum):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
```

## Kullanım

```
/instinct-status
```

## Yapılacaklar

1. Mevcut proje bağlamını tespit et (git remote/path hash)
2. `~/.claude/homunculus/projects/<project-id>/instincts/` konumundan proje içgüdülerini oku
3. `~/.claude/homunculus/instincts/` konumundan global içgüdüleri oku
4. Öncelik kurallarıyla birleştir (ID çakışmasında proje global'i geçersiz kılar)
5. Domain'e göre gruplandırılmış, güven çubukları ve gözlem istatistikleriyle göster

## Çıktı Formatı

```
============================================================
  INSTINCT STATUS - 12 total
============================================================

  Project: my-app (a1b2c3d4e5f6)
  Project instincts: 8
  Global instincts:  4

## PROJECT-SCOPED (my-app)
  ### WORKFLOW (3)
    ███████░░░  70%  grep-before-edit [project]
              trigger: when modifying code

## GLOBAL (apply to all projects)
  ### SECURITY (2)
    █████████░  85%  validate-user-input [global]
              trigger: when handling user input
```
