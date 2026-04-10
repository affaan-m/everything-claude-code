# Örnek Proje CLAUDE.md

Bu, örnek bir proje seviyesi CLAUDE.md dosyasıdır. Bunu proje kök dizininize yerleştirin.

## Proje Genel Bakış

[Projenizin kısa açıklaması - ne yaptığı, teknoloji yığını]

## Kritik Kurallar

### 1. Kod Organizasyonu

- Birkaç büyük dosya yerine çok sayıda küçük dosya
- Yüksek bağlılık, düşük bağımlılık
- Tipik olarak 200-400 satır, dosya başına maksimum 800 satır
- Tipe göre değil, özellik/domain'e göre organize edin

### 2. Kod Stili

- Kod, yorum veya dokümantasyonda emoji kullanmayın
- Her zaman değişmezlik - asla obje veya array'leri mutate etmeyin
- Production kodunda console.log kullanmayın
- try/catch ile uygun hata yönetimi
- Zod veya benzeri ile input validasyonu

### 3. Test

- TDD: Önce testleri yazın
- Minimum %80 kapsama
- Utility'ler için unit testler
- API'ler için integration testler
- Kritik akışlar için E2E testler

### 4. Güvenlik

- Hardcoded secret kullanmayın
- Hassas veriler için environment variable'lar
- Tüm kullanıcı girdilerini validate edin
- Sadece parametreli sorgular
- CSRF koruması aktif

## Dosya Yapısı

```
src/
|-- app/              # Next.js app router
|-- components/       # Tekrar kullanılabilir UI bileşenleri
|-- hooks/            # Custom React hooks
|-- lib/              # Utility kütüphaneleri
|-- types/            # TypeScript tanımlamaları
```

## Temel Desenler

### API Response Formatı

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### Hata Yönetimi

```typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'Kullanıcı dostu mesaj' }
}
```

## Environment Variable'lar

```bash
# Gerekli
DATABASE_URL=
API_KEY=

# Opsiyonel
DEBUG=false
```

## Kullanılabilir Komutlar

- `/tdd` - Test-driven development iş akışı
- `/plan` - Uygulama planı oluştur
- `/code-review` - Kod kalitesini gözden geçir
- `/build-fix` - Build hatalarını düzelt

## Git İş Akışı

- Conventional commit'ler: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Asla doğrudan main'e commit yapmayın
- PR'lar review gerektirir
- Merge'den önce tüm testler geçmeli
