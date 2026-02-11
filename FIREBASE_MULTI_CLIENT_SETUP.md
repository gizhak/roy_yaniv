# מדריך הגדרת Firebase לדפי נחיתה מרצים (multi-client)

## שלב 1: יצירת פרויקט Firebase
1. היכנס ל-Firebase Console: https://console.firebase.google.com/
2. צור פרויקט חדש בשם: lecturer-landing-page
3. הפעל Google Analytics (לא חובה)
4. בחר מיקום: europe-west1 (בלגיה)

## שלב 2: הגדרת Firestore Database
1. לחץ על "Firestore Database" בתפריט השמאלי
2. לחץ "Create database"
3. Production mode (מאובטח)
4. בחר מיקום europe-west1

## שלב 3: הגדרת Security Rules
1. עבור לטאב "Rules"
2. הדבק את הכללים הבאים:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId}/{collection}/{document=**} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
3. לחץ "Publish"

## שלב 4: קבלת קונפיגורציה
1. לחץ על הגלגל שיניים → "Project settings"
2. גלול ל-"Your apps"
3. לחץ על אייקון ה-Web (</>)
4. תן שם: lecturer-landing-page
5. לחץ "Register app"
6. העתק את אובייקט firebaseConfig

## שלב 5: עדכון קובץ firebase-config.js
פתח js/services/firebase-config.js והדבק את הערכים:
```javascript
const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "...",
    measurementId: "...",
    clientId: "demo-client" // לשנות לכל לקוח
};
export default firebaseConfig;
```

## שלב 6: בדיקת חיבור וטעינת נתונים
1. פתח test-firebase.html עם Live Server
2. לחץ "בדוק חיבור" → אמור להופיע הודעה ירוקה
3. לחץ "טען נתונים מ-data.json" → הנתונים ייטענו ל-Firestore
4. אמת ב-Firebase Console תחת clients/demo-client

## שלב 7: לקוחות נוספים
- לכל לקוח חדש:
  - העתק את התיקייה
  - שנה clientId ב-firebase-config.js (למשל "yossi-cohen")
  - שנה data.json
  - טען נתונים

## הערות
- כל הנתונים נשמרים תחת clients/{clientId}/...
- אפשר להקשיח הרשאות ב-Rules (למשל: רק כתיבה למשתמשים מחוברים)
- הקוד והמבנה מתאימים לכל דף נחיתה מרצה

## בדיקות
- בדוק חיבור ב-test-firebase.html
- בדוק נתונים ב-Firestore Console

## פתרון בעיות
- שגיאת הרשאות: בדוק Security Rules
- נתונים לא נטענים: בדוק clientId, בדוק קונפיגורציה
- CORS: השתמש ב-Live Server

---
בהצלחה!
