// App Controller - ניהול האפליקציה הראשי
import { utilService } from './services/util.service.js'
import { dataService } from './services/data.service.js'
import { i18nService } from './services/i18n.service.js'

// Default testimonial image - change this URL to set the default client photo
// שנה את הכתובת הזו כדי לקבוע תמונת ברירת מחדל ללקוחות
const DEFAULT_TESTIMONIAL_IMAGE = 'https://via.placeholder.com/100x100?text=👤'

// מספר הטלפון של המפתח - שנה למספר שלך
// Developer phone number for "רוצים גם?" link
const DEV_PHONE = '+972507402462'

// To make things easier in this project structure
// functions that are called from DOM are defined on a global app object
window.app = {
    onInit,
    onToggleMenu,
    onScrollToSection,
    onProductClick,
    onRemoveProduct,
    onEditProduct,
    onRemoveTestimonial,
    onEditTestimonial
}

window.onload = onInit

async function onInit() {
    try {
        // Initialize theme and language FIRST
        initThemeAndLanguage()

        await dataService.initData()
        await renderApp()
        setupEventListeners()
    } catch (err) {
        console.error('Error initializing app:', err)
        const msg = i18nService.getCurrentLanguage() === 'he'
            ? 'שגיאה בטעינת הנתונים'
            : 'Error loading data'
        flashMsg(msg)
    }
}

function initThemeAndLanguage() {
    // Initialize theme
    const savedTheme = i18nService.getCurrentTheme()
    i18nService.setTheme(savedTheme)

    // Initialize language
    const savedLang = i18nService.getCurrentLanguage()
    i18nService.setLanguage(savedLang)
}

async function renderApp() {
    await renderUserData()
    await renderProducts()
    await renderTestimonials()
    renderFooter()
    initCarousels()
}

async function renderUserData() {
    try {
        const userData = await dataService.getUserData()

        document.getElementById('brand-name').textContent = userData.brandName
        document.getElementById('user-image').src = userData.image
        document.getElementById('user-image').alt = userData.name
        document.getElementById('user-name').textContent = userData.name
        document.getElementById('user-title').textContent = userData.title
        document.getElementById('user-description').textContent = userData.description
        document.title = userData.brandName + ' - דף נחיתה'

        // About section
        document.getElementById('about-intro').textContent = userData.aboutIntro || ''
        document.getElementById('about-details').textContent = userData.aboutDetails || ''

        // Store phone for later use
        window.userData = userData
    } catch (err) {
        console.error('Error rendering user data:', err)
    }
}

async function renderProducts() {
    try {
        const products = await dataService.getProducts()
        const productsGrid = document.getElementById('products-grid')

        const strHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price}</div>
                <ul class="product-features">
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <button class="product-button" onclick="app.onProductClick('${product.id}')" data-i18n="courses.button">${i18nService.translate('courses.button')}</button>
            </div>
        `).join('')

        productsGrid.innerHTML = strHTML || `<p data-i18n="courses.empty">${i18nService.translate('courses.empty')}</p>`
    } catch (err) {
        console.error('Error rendering products:', err)
    }
}

async function renderTestimonials() {
    try {
        const testimonials = await dataService.getTestimonials()
        const testimonialsGrid = document.getElementById('testimonials-grid')

        const strHTML = testimonials.map(testimonial => `
            <div class="testimonial-card">
                <img src="${testimonial.image || DEFAULT_TESTIMONIAL_IMAGE}" alt="${testimonial.name}" onerror="this.src='${DEFAULT_TESTIMONIAL_IMAGE}'">
                <p class="testimonial-text">"${testimonial.text}"</p>
                <p class="testimonial-name">${testimonial.name}</p>
            </div>
        `).join('')

        testimonialsGrid.innerHTML = strHTML || `<p data-i18n="testimonials.empty">${i18nService.translate('testimonials.empty')}</p>`
    } catch (err) {
        console.error('Error rendering testimonials:', err)
    }
}

function renderFooter() {
    const userData = window.userData
    if (userData) {
        document.getElementById('phone-number').textContent = userData.phone
        // המרת מספר ישראלי לפורמט בינלאומי (972...)
        let phone = userData.phone.replace(/[^0-9]/g, '')
        if (phone.startsWith('0')) phone = '972' + phone.slice(1)
        // טקסט אוטומטי לוואטסאפ
        const msg = encodeURIComponent('שלום ד"ר ' + (userData.name || '') + ', אשמח לקבל פרטים נוספים!')
        document.getElementById('phone-link').href = `https://wa.me/${phone}?text=${msg}`
    }
    document.getElementById('current-year').textContent = new Date().getFullYear()

    // קישור "רוצים גם?" לוואטסאפ של המפתח
    const devLink = document.getElementById('dev-link')
    if (devLink) {
        const devMsg = encodeURIComponent('אני מעוניין לשמוע עוד על דף נחיתה דומה')
        devLink.href = `https://wa.me/${DEV_PHONE}?text=${devMsg}`
        devLink.target = '_blank'
    }
}

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle')
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            i18nService.toggleTheme()
        })
    }

    // Language toggle
    const langToggle = document.getElementById('lang-toggle')
    if (langToggle) {
        langToggle.addEventListener('click', async () => {
            i18nService.toggleLanguage()
            // Re-render to update content
            await renderApp()
        })
    }

    // Hamburger menu
    const hamburger = document.getElementById('hamburger')
    const navMenu = document.getElementById('nav-menu')

    hamburger.addEventListener('click', () => {
        onToggleMenu()
    })

    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-menu button')
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sectionId = e.target.getAttribute('data-section')
            onScrollToSection(sectionId)
        })
    })

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('open')
            navMenu.classList.remove('open')
        }
    })
}

// Navigation Functions
function onToggleMenu() {
    const hamburger = document.getElementById('hamburger')
    const navMenu = document.getElementById('nav-menu')

    hamburger.classList.toggle('open')
    navMenu.classList.toggle('open')
}

function onScrollToSection(sectionId) {
    const element = document.getElementById(sectionId)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        // Close menu
        document.getElementById('hamburger').classList.remove('open')
        document.getElementById('nav-menu').classList.remove('open')
    }
}

// Product Functions
async function onProductClick(productId) {
    try {
        const product = await dataService.getProductById(productId)
        const userData = window.userData

        if (!userData || !userData.phone) {
            flashMsg('מספר טלפון לא זמין')
            return
        }

        const message = `שלום, אני מעוניין/ת ב${product.name} (${product.price})`
        const cleanPhone = userData.phone.replace(/\D/g, '')
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    } catch (err) {
        console.error('Error handling product click:', err)
        flashMsg('שגיאה בפתיחת WhatsApp')
    }
}

async function onRemoveProduct(productId) {
    try {
        await dataService.removeProduct(productId)
        flashMsg('המוצר הוסר בהצלחה')
        await renderProducts()
    } catch (err) {
        console.error('Error removing product:', err)
        flashMsg('שגיאה במחיקת המוצר')
    }
}

async function onEditProduct(productId) {
    // This function can be expanded for admin panel
    console.log('Edit product:', productId)
}

// Testimonial Functions
async function onRemoveTestimonial(testimonialId) {
    try {
        await dataService.removeTestimonial(testimonialId)
        flashMsg('ההמלצה הוסרה בהצלחה')
        await renderTestimonials()
    } catch (err) {
        console.error('Error removing testimonial:', err)
        flashMsg('שגיאה במחיקת ההמלצה')
    }
}

async function onEditTestimonial(testimonialId) {
    // This function can be expanded for admin panel
    console.log('Edit testimonial:', testimonialId)
}

// Carousel Functions
function initCarousels() {
    document.querySelectorAll('.carousel-arrow').forEach(arrow => {
        arrow.addEventListener('click', () => {
            const targetId = arrow.dataset.target
            const grid = document.getElementById(targetId)
            if (!grid) return
            const cardWidth = grid.querySelector(':first-child')?.offsetWidth || 320
            const scrollAmount = cardWidth + 32 // card width + gap
            // In RTL, left arrow = scroll right (next), right arrow = scroll left (prev)
            if (arrow.classList.contains('carousel-arrow-left')) {
                grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
            } else {
                grid.scrollBy({ left: scrollAmount, behavior: 'smooth' })
            }
        })
    })

    // Update arrow visibility
    updateCarouselArrows('products-grid')
    updateCarouselArrows('testimonials-grid')

    // Listen for scroll to update arrows
    const productsGrid = document.getElementById('products-grid')
    const testimonialsGrid = document.getElementById('testimonials-grid')
    if (productsGrid) productsGrid.addEventListener('scroll', () => updateCarouselArrows('products-grid'))
    if (testimonialsGrid) testimonialsGrid.addEventListener('scroll', () => updateCarouselArrows('testimonials-grid'))

    // Update on resize
    window.addEventListener('resize', () => {
        updateCarouselArrows('products-grid')
        updateCarouselArrows('testimonials-grid')
    })
}

function updateCarouselArrows(gridId) {
    const grid = document.getElementById(gridId)
    if (!grid) return
    const wrapper = grid.closest('.carousel-wrapper')
    if (!wrapper) return

    const arrows = wrapper.querySelectorAll('.carousel-arrow')
    const hasOverflow = grid.scrollWidth > grid.clientWidth + 5
    grid.classList.toggle('has-overflow', hasOverflow)

    // If all content fits, hide both arrows
    if (!hasOverflow) {
        arrows.forEach(a => a.classList.add('hidden'))
        return
    }

    arrows.forEach(arrow => {
        arrow.classList.remove('hidden')
        const scrollLeft = Math.abs(grid.scrollLeft)
        const maxScroll = grid.scrollWidth - grid.clientWidth

        if (arrow.classList.contains('carousel-arrow-right')) {
            // Right arrow: hide when at start (nothing to go back to)
            arrow.classList.toggle('hidden', scrollLeft <= 5)
        } else {
            // Left arrow: hide when at end (nothing more to see)
            arrow.classList.toggle('hidden', scrollLeft >= maxScroll - 5)
        }
    })
}

// Utility Functions
function flashMsg(msg) {
    const el = document.createElement('div')
    el.className = 'user-msg'
    el.innerText = msg
    document.body.appendChild(el)

    setTimeout(() => {
        el.classList.add('open')
    }, 10)

    setTimeout(() => {
        el.classList.remove('open')
        setTimeout(() => el.remove(), 500)
    }, 3000)
}
