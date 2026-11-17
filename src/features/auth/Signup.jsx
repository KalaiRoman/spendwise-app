import { useState } from "react";
import "./Login.css";   // shared styles (layout, inputs, buttons)
import "./Signup.css";  // signup extras (strength meter, terms)
import { useNavigate } from "react-router-dom";
import { signupUserService } from "../../services/auth_services";
import { setCookie } from "../../utils/Token";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Brand() {
  return (
    <div className="lg-brand">
      <span className="lg-logo"><span /></span>
      Spendwise
    </div>
  );
}

// 0 to 4 score based on length and character variety
function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const LABELS = ["Too weak", "Weak", "Okay", "Good", "Strong"];

export default function Signup({ onSuccess }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", agree: false,
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const score = form.password ? strength(form.password) : 0;

  const update = (e) => {
    const { name, value, } = e.target;
    setForm((f) => ({ ...form, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (form.name.trim().length < 2) err.name = "Enter your full name.";
    if (!EMAIL_RE.test(form.email.trim())) err.email = "Enter a valid email address.";
    if (form.password.length < 8) err.password = "Use at least 8 characters.";
    if (form.confirm !== form.password) err.confirm = "Passwords do not match.";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {

      const response = await signupUserService({
        email: form?.email,
        name: form?.name,
        password: form?.password
      });
      if (response) {
        setCookie(response?.data?.token);
        setTimeout(() => {
          navigate("/dashboard")
        }, 1000);
      }
      await new Promise((r) => setTimeout(r, 900));
      setDone(true);
      onSuccess?.(form.email);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };



  const loginPage = () => {
    navigate("/");
  }

  return (
    <div className="lg-page">
      <aside className="lg-side" aria-hidden="true">
        <Brand />
        <div>
          <p>Set a monthly budget and watch your</p>
          <div className="lg-big">balance</div>
          <div className="lg-ledger"><i /><b /></div>
          <div className="lg-legend"><span>Spent</span><span>Left</span></div>
        </div>
        <p>Free to start. Your first month takes two minutes to set up.</p>
      </aside>

      <main className="lg-main">
        <div className="lg-panel">
          <Brand />
          <h1>Create your account</h1>
          <p className="lg-sub">Start tracking your spending month by month.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="lg-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name" name="name" type="text" autoComplete="name"
                placeholder="Your name" value={form.name} onChange={update}
                className={errors.name ? "bad" : ""}
              />
              {errors.name && <p className="lg-msg" role="alert">{errors.name}</p>}
            </div>

            <div className="lg-field">
              <label htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" inputMode="email" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={update}
                className={errors.email ? "bad" : ""}
              />
              {errors.email && <p className="lg-msg" role="alert">{errors.email}</p>}
            </div>

            <div className="lg-field">
              <label htmlFor="password">Password</label>
              <div className="lg-inp">
                <input
                  id="password" name="password" type={showPw ? "text" : "password"}
                  autoComplete="new-password" placeholder="At least 8 characters"
                  value={form.password} onChange={update}
                  className={errors.password ? "bad" : ""}
                />
                <button
                  type="button" className="lg-eye"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {form.password && (
                <div className="su-strength" aria-live="polite">
                  <div className="su-bars">
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} className={n <= score ? `on s${score}` : ""} />
                    ))}
                  </div>
                  <small>{LABELS[score]}</small>
                </div>
              )}
              {errors.password && <p className="lg-msg" role="alert">{errors.password}</p>}
            </div>

            <div className="lg-field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm" name="confirm" type={showPw ? "text" : "password"}
                autoComplete="new-password" placeholder="Re-enter your password"
                value={form.confirm} onChange={update}
                className={errors.confirm ? "bad" : ""}
              />
              {errors.confirm && <p className="lg-msg" role="alert">{errors.confirm}</p>}
            </div>
            {errors.form && <p className="lg-msg" role="alert">{errors.form}</p>}

            <button className="lg-btn" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
            {done && <div className="lg-ok" role="status">Account created. Taking you to your dashboard…</div>}
          </form>

          <div className="lg-or">or</div>
          <button className="lg-alt" type="button">Sign up with Google</button>

          <p className="lg-foot">
            Already have an account? <span style={{ color: "blue", cursor: "pointer" }} onClick={loginPage}>Log in</span>
          </p>
        </div>
      </main>
    </div>
  );
}