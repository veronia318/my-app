import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './RegisterForm.css'; 

function RegisterForm() {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        // 2. إرسال البيانات إلى نقطة نهاية الـ Backend
        const API_ENDPOINT = '/api/register'; // ⬅️ استبدلي هذا بعنوان نقطة النهاية الفعلية
        
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // نرسل البيانات (بدون حقل تأكيد كلمة المرور)
                body: JSON.stringify({
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (response.ok) {
                console.log("Registration successful!");
                // 3. الانتقال إلى صفحة LiveReadings عند النجاح
                navigate('/live-readings'); 
            } else {
                // التعامل مع الأخطاء من الـ Backend (مثل: البريد الإلكتروني مستخدم)
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed due to server error.');
            }
        } catch (err) {
            console.error("Network or Fetch Error:", err);
            setError("Could not connect to the server.");
        }
    };

    return (
        <div className="register-container-wrapper"> 
            <form className="register-form-new" onSubmit={handleSubmit}>
                {/* ... (Header and Title sections) ... */}
                
                <div className="header">
                    <span className="dot"></span> 
                    <h1 className="title-new">Register</h1>
                </div>
                
                <p className="message-new">Signup now and get full access to our app.</p>
                
                {/* ⬅️ عرض رسالة الخطأ */}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>} 

                <div className="input-group flex-row">
                    <input name="firstname" value={formData.firstname} onChange={handleChange} required placeholder="Firstname" type="text" className="input-new" />
                    <input name="lastname" value={formData.lastname} onChange={handleChange} required placeholder="Lastname" type="text" className="input-new" />
                </div>

                <div className="input-group">
                    <input name="email" value={formData.email} onChange={handleChange} required placeholder="Email" type="email" className="input-new" />
                </div> 
                
                <div className="input-group">
                    <input name="password" value={formData.password} onChange={handleChange} required placeholder="Password" type="password" className="input-new" />
                </div>
                
                <div className="input-group">
                    <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm password" type="password" className="input-new" />
                </div>
                
                <button className="submit-new" type="submit">Submit</button>

                <p className="signin-new">
                    Already have an account ? <a href="login">Signin</a> 
                </p>
            </form>
        </div>
    );
}

export default RegisterForm;