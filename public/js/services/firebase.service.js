// 🔥 Universal Firebase Service - Multi-Client Support!
// One Firebase project → Multiple clients with unique IDs

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'

import firebaseConfig from './firebase-config.js'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Get client ID from config
const CLIENT_ID = firebaseConfig.clientId || 'default-client'

// 📝 Configuration - Customize for each starter type
const COLLECTIONS = {
    USER: 'siteData',
    PRODUCTS: 'products',      // Change to: 'services', 'courses', 'items', etc.
    TESTIMONIALS: 'testimonials' // Change to: 'reviews', 'feedback', etc.
}

// 🎯 Helper: Get client-specific path
function getClientPath(collectionName) {
    return `clients/${CLIENT_ID}/${collectionName}`
}

export const firebaseService = {
    // Generic CRUD Functions - Work with ANY collection
    getCollection,
    getDocById,
    addToCollection,
    updateDoc: updateDocument,
    removeDoc: removeDocument,

    // User Data (Single Document)
    getUserData,
    saveUserData,

    // Products CRUD (Uses Generic Functions)
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    removeProduct,

    // Testimonials CRUD (Uses Generic Functions)
    getTestimonials,
    getTestimonialById,
    addTestimonial,
    updateTestimonial,
    removeTestimonial,

    // Initialize from JSON
    initFromJSON,

    // Direct Firebase access (for advanced users)
    db,
    COLLECTIONS,
    CLIENT_ID,
    getClientPath
}

// ===== GENERIC CRUD FUNCTIONS =====
// 🎯 These work with ANY collection - just pass the collection name!

async function getCollection(collectionName) {
    try {
        const clientPath = getClientPath(collectionName)
        const querySnapshot = await getDocs(collection(db, clientPath))
        const items = []
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() })
        })
        return items
    } catch (error) {
        console.error(`Error getting ${collectionName} for client ${CLIENT_ID}:`, error)
        throw error
    }
}

async function getDocById(collectionName, docId) {
    try {
        const clientPath = getClientPath(collectionName)
        const docRef = doc(db, clientPath, docId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() }
        }
        return null
    } catch (error) {
        console.error(`Error getting document from ${collectionName}:`, error)
        throw error
    }
}

async function addToCollection(collectionName, data, customId = null) {
    try {
        const id = customId || collectionName.charAt(0) + Date.now()
        const clientPath = getClientPath(collectionName)
        const docRef = doc(db, clientPath, id)
        const newItem = { ...data, id }
        await setDoc(docRef, newItem)
        return newItem
    } catch (error) {
        console.error(`Error adding to ${collectionName}:`, error)
        throw error
    }
}

async function updateDocument(collectionName, docId, data) {
    try {
        const clientPath = getClientPath(collectionName)
        const docRef = doc(db, clientPath, docId)
        await updateDoc(docRef, data)
        return data
    } catch (error) {
        console.error(`Error updating ${collectionName}:`, error)
        throw error
    }
}

async function removeDocument(collectionName, docId) {
    try {
        const clientPath = getClientPath(collectionName)
        const docRef = doc(db, clientPath, docId)
        await deleteDoc(docRef)
        return docId
    } catch (error) {
        console.error(`Error removing from ${collectionName}:`, error)
        throw error
    }
}

// ===== USER DATA =====
// Single document storage for site configuration

async function getUserData() {
    try {
        const clientPath = getClientPath(COLLECTIONS.USER)
        const docRef = doc(db, clientPath, 'user')
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return docSnap.data()
        }
        return null
    } catch (error) {
        console.error('Error getting user data:', error)
        throw error
    }
}

async function saveUserData(userData) {
    try {
        const clientPath = getClientPath(COLLECTIONS.USER)
        const docRef = doc(db, clientPath, 'user')
        await setDoc(docRef, userData)
        return userData
    } catch (error) {
        console.error('Error saving user data:', error)
        throw error
    }
}

// ===== PRODUCTS =====
// Using generic functions with PRODUCTS collection

function getProducts() {
    return getCollection(COLLECTIONS.PRODUCTS)
}

function getProductById(productId) {
    return getDocById(COLLECTIONS.PRODUCTS, productId)
}

function addProduct(product) {
    return addToCollection(COLLECTIONS.PRODUCTS, product, 'p' + Date.now())
}

async function updateProduct(product) {
    const clientPath = getClientPath(COLLECTIONS.PRODUCTS)
    const docRef = doc(db, clientPath, product.id)
    await updateDoc(docRef, product)
    return product
}

function removeProduct(productId) {
    return removeDocument(COLLECTIONS.PRODUCTS, productId)
}

// ===== TESTIMONIALS =====
// Using generic functions with TESTIMONIALS collection

function getTestimonials() {
    return getCollection(COLLECTIONS.TESTIMONIALS)
}

function getTestimonialById(testimonialId) {
    return getDocById(COLLECTIONS.TESTIMONIALS, testimonialId)
}

function addTestimonial(testimonial) {
    return addToCollection(COLLECTIONS.TESTIMONIALS, testimonial, 't' + Date.now())
}

async function updateTestimonial(testimonial) {
    const clientPath = getClientPath(COLLECTIONS.TESTIMONIALS)
    const docRef = doc(db, clientPath, testimonial.id)
    await updateDoc(docRef, testimonial)
    return testimonial
}

function removeTestimonial(testimonialId) {
    return removeDocument(COLLECTIONS.TESTIMONIALS, testimonialId)
}

// ===== INITIALIZE FROM JSON =====
async function initFromJSON(jsonData) {
    try {
        // Save user data
        if (jsonData.user) {
            await saveUserData(jsonData.user)
        }

        // Save products
        if (jsonData.products && Array.isArray(jsonData.products)) {
            for (const product of jsonData.products) {
                await addProduct(product)
            }
        }

        // Save testimonials
        if (jsonData.testimonials && Array.isArray(jsonData.testimonials)) {
            for (const testimonial of jsonData.testimonials) {
                await addTestimonial(testimonial)
            }
        }

        console.log('Data initialized from JSON successfully')
        return true
    } catch (error) {
        console.error('Error initializing from JSON:', error)
        throw error
    }
}