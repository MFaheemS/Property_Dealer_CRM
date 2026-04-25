// Auth pages (login/signup) share this layout — no sidebar, centered content
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}
