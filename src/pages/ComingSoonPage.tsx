export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted">This page is coming in a later batch.</p>
    </div>
  )
}