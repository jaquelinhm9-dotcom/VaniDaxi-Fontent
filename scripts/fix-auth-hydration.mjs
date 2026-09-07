import { readFileSync, writeFileSync } from "node:fs";

const path = "App.jsx";
let source = readFileSync(path, "utf8");

const replacements = [
  [
    'function ProtectedRoute({ user, children }) {\n  const navigate = useNavigate();\n  useEffect(() => { if (!user) navigate("/login", { replace: true }); }, [user, navigate]);\n  if (!user) return null;\n  return children;\n}',
    'function ProtectedRoute({ user, authReady, children }) {\n  const navigate = useNavigate();\n\n  useEffect(() => {\n    if (authReady && !user) {\n      navigate("/login", { replace: true });\n    }\n  }, [authReady, user, navigate]);\n\n  if (!authReady) {\n    return (\n      <main className="page-shell inner-page">\n        <div className="empty">\n          <p>Comprobando sesión...</p>\n        </div>\n      </main>\n    );\n  }\n\n  if (!user) return null;\n  return children;\n}',
  ],
  [
    '  const [user, setUser] = useState(null);\n  const [search, setSearch] = useState("");',
    '  const [user, setUser] = useState(null);\n  const [authReady, setAuthReady] = useState(false);\n  const [search, setSearch] = useState("");',
  ],
  [
    '      setUser(sessionUser);\n      if (productResult?.data?.length)',
    '      setUser(sessionUser);\n      setAuthReady(true);\n      if (productResult?.data?.length)',
  ],
  [
    '      setUser(nextUser);\n      if (nextUser?.id)',
    '      setUser(nextUser);\n      setAuthReady(true);\n      if (nextUser?.id)',
  ],
  [
    '<ProtectedRoute user={user}>',
    '<ProtectedRoute user={user} authReady={authReady}>',
  ],
  [
    'redirectTo: `${window.location.origin}/VaniDaxi-frontend/perfil`,',
    'redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}perfil`,',
  ],
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    throw new Error(`Expected source fragment was not found: ${from.slice(0, 80)}`);
  }
  source = source.replace(from, to);
}

writeFileSync(path, source);
console.log("Auth hydration guard and current password-reset base path applied.");
