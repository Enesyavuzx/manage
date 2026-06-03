'use client'

const UPDATED = '2026-06-03'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Gizlilik Politikası</h1>
        <p className="mt-0.5 text-sm text-muted">Son güncelleme: {UPDATED}</p>
      </div>

      <Section title="Özet">
        <p>
          Manage, alışkanlık takibi için tasarlanmış bir uygulamadır. Verilerin varsayılan olarak
          yalnızca kendi cihazında saklanır. Reklam göstermeyiz, seni izlemeyiz ve verini üçüncü
          taraflarla paylaşmayız.
        </p>
      </Section>

      <Section title="Hangi verileri tutuyoruz">
        <p>
          Oluşturduğun alışkanlıklar, tamamlamalar, ruh hali kayıtları, notlar, bütçe kayıtları,
          XP/seviye ilerlemesi ve uygulama ayarların. Bu veriler cihazının yerel depolamasında
          (localStorage) tutulur.
        </p>
      </Section>

      <Section title="Bulut senkronu (opsiyonel)">
        <p>
          Bulut senkronunu yalnızca sen açarsan devreye girer. Açtığında verilerin, senin
          yapılandırdığın Supabase projesinde anonim bir kimlikle saklanır ve cihazların arasında
          eşitlenir. Bu özellik kapalıyken hiçbir veri cihazından dışarı çıkmaz.
        </p>
      </Section>

      <Section title="Bildirimler">
        <p>
          Hatırlatıcı bildirimleri cihazında yerel olarak çalışır. Bildirim içeriği bir sunucuya
          gönderilmez; doğrudan cihazında üretilir.
        </p>
      </Section>

      <Section title="Veri kontrolü">
        <p>
          Tüm verini Profil sayfasından JSON olarak dışa aktarabilir, içe aktarabilir veya
          uygulamayı kaldırarak/depolamayı temizleyerek tamamen silebilirsin. Verinin sahibi sensin.
        </p>
      </Section>

      <Section title="Çocukların gizliliği">
        <p>
          Uygulama bilinçli olarak 13 yaş altındaki çocuklardan kişisel veri toplamaz.
        </p>
      </Section>

      <Section title="İletişim">
        <p>
          Gizlilikle ilgili sorular için: privacy@manage.app
        </p>
      </Section>
    </div>
  )
}
