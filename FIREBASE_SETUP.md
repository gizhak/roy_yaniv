# 🔥 Firebase Setup Guide - מדריך הגדרת Firebase

## שלב 1: יצירת פרויקט Firebase

1. **היכנס ל-Firebase Console**
   - גש ל: https://console.firebase.google.com/
   - התחבר עם חשבון Google

2. **צור פרויקט חדש**
   - לחץ על "Add project" / "הוסף פרויקט"
   - תן שם לפרויקט (לדוגמה: `lecturer-site-john-doe`)
   - **חשוב מאוד**: 
     * כל לקוח = פרויקט Firebase מלא ונפרד!
     * לא פרויקט אחד עם תתי-פרויקטים
     * לדוגמה: 3 לקוחות = 3 פרויקטים שונים ב-Firebase
     * זה מבטיח הפרדה מלאה של הנתונים

3. **הגדרות אופציונליות**
   - Google Analytics - לא חובה, אפשר לדלג
   - לחץ "Create project" / "צור פרויקט"

---

## שלב 2: הגדרת Firestore Database

1. **בצד שמאל, לחץ על "Firestore Database"**

2. **לחץ "Create database"**

3. **בחר מיקום:**
   - Production mode (מומלץ)
   - בחר Location קרוב (לדוגמה: `europe-west1` לישראל)

4. **אישור ויצירה** - לחץ "Enable"

---

## שלב 3: הגדרת Security Rules

בטאב **Rules** של Firestore, העתק את הקוד הזה:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow write only to specific collections
    match /siteData/{document} {
      allow write: if true;
    }
    match /products/{document} {
      allow write: if true;
    }
    match /testimonials/{document} {
      allow write: if true;
    }
  }
}
```

**⚠️ אזהרה:** זה מאפשר קריאה וכתיבה לכולם! מתאים רק ל-landing pages פשוטים.

**לחץ "Publish"**

---

## שלב 4: קבלת Configuration

1. **לחץ על ⚙️ (Settings) ליד "Project Overview"**

2. **לחץ על "Project settings"**

3. **גלול למטה ל-"Your apps"**

4. **לחץ על האייקון `</>`** (Web app)

5. **תן שם לאפליקציה** (לדוגמה: "Landing Page")

6. **סמן "Also set up Firebase Hosting"** - לא חובה

7. **לחץ "Register app"**

8. **העתק את ה-Config:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:xxxxxxxxxxxxx"
   };
   ```

---

## שלב 5: הדבק את ה-Config בקוד שלך

פתח את הקובץ:
```
js/services/firebase-config.js
```

החלף את כל התוכן ב:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",           // מכאן
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
}

export default firebaseConfig
```

**הדבק את הערכים שקיבלת מ-Firebase Console!**

---

## שלב 6: אתחול נתונים ראשוני (חובה!)

אחרי ההגדרה, צריך לטעון את הנתונים מ-`data.json` ל-Firestore:

1. **פתח את admin.html בדפדפן:**
   ```
   file:///C:/Users/YourName/.../admin.html
   ```

2. **פתח Console (F12)**

3. **הרץ:**
   ```javascript
   // טען את Firebase Service
   import('./js/services/firebase.service.js').then(module => {
       const { firebaseService } = module;
       
       // טען את data.json
       fetch('data.json')
           .then(r => r.json())
           .then(data => firebaseService.initFromJSON(data))
           .then(() => console.log('✅ Data initialized!'))
           .catch(err => console.error('❌ Error:', err));
   });
   ```

---

## ✅ בדיקה שהכל עובד

### בדיקה 1: Firestore Console
1. גש ל-Firebase Console
2. לחץ על "Firestore Database"
3. אתה אמור לראות 3 Collections:
   - `siteData` (עם document בשם "user")
   - `products` (עם כל הקורסים)
   - `testimonials` (עם כל ההמלצות)

### בדיקה 2: בקוד
פתח Console בדפדפן והרץ:
```javascript
import('./js/services/firebase.service.js').then(async module => {
    const { firebaseService } = module;
    
    // בדיקת User Data
    const user = await firebaseService.getUserData();
    console.log('User:', user);
    
    // בדיקת Products
    const products = await firebaseService.getProducts();
    console.log('Products:', products);
    
    // בדיקת Testimonials
    const testimonials = await firebaseService.getTestimonials();
    console.log('Testimonials:', testimonials);
});
```

אם אתה רואה את הנתונים - **הכל עובד!** 🎉

---

## 🚨 פתרון בעיות נפוצות

### שגיאה: "Failed to fetch"
- בדוק שה-apiKey נכון
- בדוק שהפרויקט זמין ב-Firebase Console

### שגיאה: "Permission denied"
- בדוק את ה-Security Rules ב-Firestore
- ודא שיש `allow read/write: if true`

### נתונים לא מופיעים
- הרץ שוב את `initFromJSON`
- בדוק ב-Firestore Console שהנתונים נשמרו

### CORS Error
- Firebase עובד רק מ-HTTP/HTTPS, לא מ-file://
- השתמש ב-Live Server ב-VSCode
- או הרץ: `python -m http.server 8000`

---

## 📝 לקוחות נוספים - תהליך העבודה

### דוגמה: יש לך 3 לקוחות

**לקוח 1: יוסי כהן (מרצה למתמטיקה)**
1. צור פרויקט Firebase: `lecturer-site-yossi-cohen`
2. קבל Config משלו
3. העתק את כל התיקייה של הסטארטר
4. החלף את `firebase-config.js` עם הפרטים של יוסי
5. שנה את `data.json` עם המידע של יוסי
6. הרץ `initFromJSON`
7. העלה לדומיין של יוסי (yossi-lectures.com)

**לקוח 2: שרה לוי (מרצה לפסיכולוגיה)**
1. צור פרויקט Firebase **חדש**: `lecturer-site-sara-levy`
2. קבל Config משלה
3. העתק שוב את התיקייה של הסטארטר
4. החלף את `firebase-config.js` עם הפרטים של שרה
5. שנה את `data.json` עם המידע של שרה
6. הרץ `initFromJSON`
7. העלה לדומיין של שרה (sara-psychology.com)

**לקוח 3: דני גולן (מרצה לתכנות)**
1. צור פרויקט Firebase **חדש**: `lecturer-site-danny-golan`
2. ... וכן הלאה

### ✅ היתרונות:
- כל לקוח מבודד לגמרי - אין סיכון של ערבוב נתונים
- אם לקוח אחד עושה בעיות, הוא לא משפיע על האחרים
- קל לנהל ולמחוק לקוחות
- כל לקוח יכול לקבל גישת ניהול לפרויקט שלו בלבד

### 📂 המבנה שלך במחשב:
```
Projects/
├── lecturer-site-yossi/
│   ├── js/services/firebase-config.js  (Config של יוסי)
│   └── data.json (נתוני יוסי)
│
├── lecturer-site-sara/
│   ├── js/services/firebase-config.js  (Config של שרה)
│   └── data.json (נתוני שרה)
│
└── lecturer-site-danny/
    ├── js/services/firebase-config.js  (Config של דני)
    └── data.json (נתוני דני)
```

**הכל האחר (HTML, CSS, קוד ה-Services) זהה לגמרי!** ✨
