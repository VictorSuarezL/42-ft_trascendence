import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './ProfilePage.module.scss';
import defaultProfileImage from '../../assets/defaultProfile.webp';

type ProfileFormState = {
  login: string;
  firstName: string;
  lastName: string;
  displayName: string;
  image: string;
};

const getImageUrl = (image?: string | null) => {
  if (!image) {
    return defaultProfileImage;
  }

  if (image.startsWith('http')) {
    return image;
  }

  return `http://localhost:3000${image}`;
};

export function ProfilePage() {
  const { user, loading, logout, setUser } = useUser();
  console.log('ProfilePage user:', user);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [formData, setFormData] = useState<ProfileFormState>({
    login: '',
    firstName: '',
    lastName: '',
    displayName: '',
    image: '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      login: user.login ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      displayName: user.displayName ?? '',
      image: user.image ?? '',
    });

    setPreviewImage('');
  }, [user]);

  const syncFormWithUser = () => {
    if (!user) {
      return;
    }

    setFormData({
      login: user.login ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      displayName: user.displayName ?? '',
      image: user.image ?? '',
    });

    setPreviewImage('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStartEdit = () => {
    syncFormWithUser();
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    syncFormWithUser();
    setEditMode(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const payload = new FormData();
    payload.append('login', formData.login);
    payload.append('firstName', formData.firstName);
    payload.append('lastName', formData.lastName);
    payload.append('displayName', formData.displayName);

    const imageFile = fileInputRef.current?.files?.[0];
    if (imageFile) {
      payload.append('image', imageFile);
    }

    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      credentials: 'include',
      body: payload,
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setUser(data.user);
    setEditMode(false);
    setPreviewImage('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user found</div>;
  }

  return (
    <div className={styles.profile}>
      <h1>Welcome to the Profile Page!</h1>

      <form className={styles.userInfo} onSubmit={handleSave}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img
              className={styles.profileImage}
              src={
                previewImage
                  ? previewImage
                  : getImageUrl(formData.image || user.image)
              }
              alt={`Profile of ${user.displayName}`}
            />

            {editMode && (
              <button
                type="button"
                className={styles.avatarEditButton}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile image"
              >
                <span className={styles.avatarEditIcon}>✎</span>
              </button>
            )}

            {editMode && (
              <input
                ref={fileInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            )}
          </div>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Login</span>
            {editMode ? (
              <input
                className={styles.fieldInput}
                name="login"
                value={formData.login}
                onChange={handleChange}
                type="text"
              />
            ) : (
              <span className={styles.fieldValue}>{user.login}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{user.email}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>First Name</span>
            {editMode ? (
              <input
                className={styles.fieldInput}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
              />
            ) : (
              <span className={styles.fieldValue}>{user.firstName}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Last Name</span>
            {editMode ? (
              <input
                className={styles.fieldInput}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
              />
            ) : (
              <span className={styles.fieldValue}>{user.lastName}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Display Name</span>
            {editMode ? (
              <input
                className={styles.fieldInput}
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                type="text"
              />
            ) : (
              <span className={styles.fieldValue}>{user.displayName}</span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {!editMode ? (
            <>
              <button type="button" onClick={handleLogout}>
                Log out!
              </button>
              <button type="button" onClick={handleStartEdit}>
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <button type="submit">Save</button>
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
