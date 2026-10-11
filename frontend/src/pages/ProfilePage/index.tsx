import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './ProfilePage.module.scss';
import defaultProfileImage from '../../assets/defaultProfile.webp';
import { apiUrl, uploadUrl } from '../../lib/api';

const getImageUrl = (image?: string | null): string => {
  if (!image) return defaultProfileImage;
  return uploadUrl(image) ?? defaultProfileImage;
};

export function ProfilePage() {
  const { user, loading, logout, setUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit form state — only used while in edit mode
  const [login, setLogin] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');

  const enterEditMode = () => {
    if (!user) return;
    setLogin(user.login ?? '');
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setDisplayName(user.displayName ?? '');
    setPreviewImage('');
    setSaveError('');
    setEditMode(true);
  };

  const cancelEditMode = () => {
    setEditMode(false);
    setPreviewImage('');
    setSaveError('');
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || saving) return;
    if (!login.trim()) { setSaveError('Login is required.'); return; }

    setSaveError('');
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('login', login.trim());
      payload.append('firstName', firstName);
      payload.append('lastName', lastName);
      payload.append('displayName', displayName);
      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) payload.append('image', imageFile);

      const response = await fetch(apiUrl('/api/users/me'), {
        method: 'PATCH',
        credentials: 'include',
        body: payload,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setSaveError(data?.error ?? `Error ${response.status}`);
        return;
      }

      // Re-fetch the full user
      const meRes = await fetch(apiUrl('/api/auth/me'), { credentials: 'include' });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }

      setEditMode(false);
      setPreviewImage('');
    } catch {
      setSaveError('Network error — could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    const res = await fetch(apiUrl('/api/users/me'), { method: 'DELETE', credentials: 'include' });
    if (!res.ok) return;
    await logout();
    navigate('/');
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/home')}>
        ← Back
      </button>

      {!editMode ? (
        /* ── VIEW MODE ── */
        <div className={styles.userInfo}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img
                className={styles.profileImage}
                src={getImageUrl(user.image)}
                alt={user.displayName ?? user.login ?? ''}
              />
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Login</span>
              <span className={styles.fieldValue}>{user.login}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <span className={styles.fieldValue}>{user.email}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>First Name</span>
              <span className={styles.fieldValue}>{user.firstName}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Last Name</span>
              <span className={styles.fieldValue}>{user.lastName}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Display Name</span>
              <span className={styles.fieldValue}>{user.displayName}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={enterEditMode}>Edit Profile</button>
            <button type="button" onClick={handleLogout}>Log out</button>
            <button type="button" onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </div>
      ) : (
        /* ── EDIT MODE ── */
        <form className={styles.userInfo} onSubmit={handleSave}>
          {saveError && <p className={styles.saveError}>{saveError}</p>}

          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img
                className={styles.profileImage}
                src={previewImage || getImageUrl(user.image)}
                alt={user.displayName ?? user.login ?? ''}
              />
              <button
                type="button"
                className={styles.avatarEditButton}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile image"
              >
                <span className={styles.avatarEditIcon}>✎</span>
              </button>
              <input
                ref={fileInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Login</span>
              <input className={styles.fieldInput} value={login} onChange={e => setLogin(e.target.value)} type="text" required />
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <span className={styles.fieldValue}>{user.email}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>First Name</span>
              <input className={styles.fieldInput} value={firstName} onChange={e => setFirstName(e.target.value)} type="text" />
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Last Name</span>
              <input className={styles.fieldInput} value={lastName} onChange={e => setLastName(e.target.value)} type="text" />
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Display Name</span>
              <input className={styles.fieldInput} value={displayName} onChange={e => setDisplayName(e.target.value)} type="text" />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={cancelEditMode} disabled={saving}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
