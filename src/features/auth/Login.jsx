import { useState } from "react";
import "./Login.css";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import { jwtDecode } from "jwt-decode";
import { loginUserService } from "../../services/auth_services";
import { setCookie } from "../../utils/Token";
function Brand() {
  return (
    <div className="lg-brand">
      <span className="lg-logo"><span /></span>
      Spendwise
    </div>
  );
}

export default function Login({ onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const err = {};
    if (!EMAIL_RE.test(form.email.trim())) err.email = "Enter a valid email address.";
    if (form.password.length < 6) err.password = "Password must be at least 6 characters.";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setDone(true);
      onSuccess?.(form.email);
      const response = await loginUserService({
        email: form?.email,
        password: form?.password
      })
      if (response) {
        setCookie(response?.data?.token);
        setTimeout(() => {
          navigate("/dashboard")
        }, 1000);
      }
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (credentialResponse) => {
    try {
      const decode = jwtDecode(credentialResponse.credential)
      console.log(decode);
      const response = await loginUserService({
        email: decode?.email,
        userName: decode?.name
      })
    } catch (error) {

    }

  };


  const signPage = () => {
    navigate("/signup")
  }

  return (
    <div className="lg-page">
      <aside className="lg-side" aria-hidden="true">
        <Brand />
        <div>
          <p>Balance left this month</p>
          <div className="lg-big">₹11,450</div>
          <div className="lg-ledger"><i /><b /></div>
          <div className="lg-legend"><span>62% spent</span><span>38% left</span></div>
        </div>
        <p>See where every rupee goes, month by month.</p>
      </aside>

      <main className="lg-main">
        <div className="lg-panel">
          <Brand />
          <h1>Welcome back</h1>
          <p className="lg-sub">Log in to see your monthly spending.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="lg-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update}
                className={errors.email ? "bad" : ""}
              />
              {errors.email && <p className="lg-msg" role="alert">{errors.email}</p>}
            </div>

            <div className="lg-field">
              <label htmlFor="password">Password</label>
              <div className="lg-inp">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={update}
                  className={errors.password ? "bad" : ""}
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="lg-msg" role="alert">{errors.password}</p>}
            </div>

            <div className="lg-row">
              <label>
              </label>
              <a href="/forgot-password">Forgot password?</a>
            </div>

            {errors.form && <p className="lg-msg" role="alert">{errors.form}</p>}

            <button className="lg-btn" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
            {done && <div className="lg-ok" role="status">Logged in. Opening your dashboard…</div>}
          </form>

          <div className="lg-or">or</div>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log("Login Failed")}
          />
          <p className="lg-foot" >
            New here? <span onClick={signPage} style={{ color: "blue", cursor: "pointer" }}>Create an account</span>
          </p>
        </div>
      </main>
    </div>
  );
}