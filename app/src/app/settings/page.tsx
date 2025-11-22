export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <main className="p-6 w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Configuraciones</h1>
        <p className="text-sm text-muted">Próximas opciones: datos bancarios, notificaciones, métodos de pago.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-dark rounded-xl p-4">
          <h3 className="text-lg font-semibold">Métodos de pago</h3>
          <p className="text-sm text-muted mt-2">(Placeholder) Agregar cuentas bancarias o tarjetas aquí más adelante.</p>
        </div>

        <div className="card-dark rounded-xl p-4">
          <h3 className="text-lg font-semibold">Notificaciones</h3>
          <p className="text-sm text-muted mt-2">(Placeholder) Configura alertas y notificaciones.</p>
        </div>
      </section>
    </main>
  );
}
