document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.getElementById('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });

    // Mobile menu toggle with improved UX
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('nav');
    const body = document.body;
    
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        
        // Animate menu toggle icon
        const icon = this.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
            nav.classList.remove('active');
            body.style.overflow = '';
            menuToggle.querySelector('i').className = 'fas fa-bars';
        }
    });

    // Enhanced workshop data with more details
    const workshops = {
        upcoming: [
            {
                id: 1,
                title: "Advanced Web Development with React",
                category: "technology",
                date: "2024-01-15",
                description: "Learn to build modern web applications using React, Redux, and React Router. Master state management and component architecture.",
                instructor: "Dr. Sanjaya Gamage",
                image: "https://source.unsplash.com/random/600x400/?web,development,react",
                duration: "2 days",
                level: "Intermediate"
            },
            {
                id: 2,
                title: "Data Science Fundamentals",
                category: "technology",
                date: "2024-01-20",
                description: "Introduction to data science concepts with Python and Jupyter notebooks. Learn data analysis and visualization techniques.",
                instructor: "Prof. Nimal Perera",
                image: "https://source.unsplash.com/random/600x400/?data,science,python",
                duration: "3 days",
                level: "Beginner"
            },
            {
                id: 3,
                title: "Digital Marketing Strategies",
                category: "business",
                date: "2024-02-05",
                description: "Learn effective digital marketing techniques for the modern business landscape. SEO, SEM, and social media marketing.",
                instructor: "Ms. Anoma Silva",
                image: "https://source.unsplash.com/random/600x400/?marketing,digital,business",
                duration: "1 day",
                level: "All Levels"
            },
            {
                id: 4,
                title: "UI/UX Design Principles",
                category: "design",
                date: "2024-02-15",
                description: "Master the fundamentals of user interface and user experience design. Learn design thinking and prototyping.",
                instructor: "Mr. Kamal Fernando",
                image: "https://source.unsplash.com/random/600x400/?design,ui,ux",
                duration: "2 days",
                level: "Beginner"
            },
            {
                id: 5,
                title: "Machine Learning Basics",
                category: "technology",
                date: "2024-02-25",
                description: "Introduction to machine learning algorithms and their applications. Hands-on experience with real datasets.",
                instructor: "Dr. Sunil Rathnayake",
                image: "https://source.unsplash.com/random/600x400/?machine,learning,ai",
                duration: "3 days",
                level: "Intermediate"
            },
            {
                id: 6,
                title: "Business Analytics",
                category: "business",
                date: "2024-03-10",
                description: "Learn to analyze business data and make data-driven decisions. Excel, SQL, and visualization tools.",
                instructor: "Mr. Rajitha Kuruppu",
                image: "https://source.unsplash.com/random/600x400/?analytics,business,data",
                duration: "2 days",
                level: "Intermediate"
            }
        ],
        past: [
            {
                id: 7,
                title: "Python Programming Basics",
                category: "technology",
                date: "2023-12-10",
                description: "Introduction to Python programming for beginners. Learn syntax, data structures, and basic algorithms.",
                instructor: "Dr. Sunil Rathnayake",
                image: "https://source.unsplash.com/random/600x400/?python,code,programming",
                duration: "2 days",
                level: "Beginner"
            },
            {
                id: 8,
                title: "Entrepreneurship Workshop",
                category: "business",
                date: "2023-11-20",
                description: "Learn how to start and grow your own business. Business planning, funding, and market analysis.",
                instructor: "Mr. Rajitha Kuruppu",
                image: "https://source.unsplash.com/random/600x400/?business,entrepreneur,startup",
                duration: "1 day",
                level: "All Levels"
            },
            {
                id: 9,
                title: "Graphic Design Fundamentals",
                category: "design",
                date: "2023-10-15",
                description: "Introduction to graphic design using Adobe tools. Learn typography, color theory, and layout principles.",
                instructor: "Ms. Priyanka Bandara",
                image: "https://source.unsplash.com/random/600x400/?graphic,design,adobe",
                duration: "2 days",
                level: "Beginner"
            },
            {
                id: 10,
                title: "Academic Research Methods",
                category: "research",
                date: "2023-09-05",
                description: "Learn proper research methodologies for academic writing. Literature review, data collection, and analysis.",
                instructor: "Dr. Harsha Wijayawardhana",
                image: "https://source.unsplash.com/random/600x400/?research,books,academic",
                duration: "3 days",
                level: "Advanced"
            },
            {
                id: 11,
                title: "Cloud Computing with AWS",
                category: "technology",
                date: "2023-08-18",
                description: "Introduction to cloud computing using Amazon Web Services. EC2, S3, and basic cloud architecture.",
                instructor: "Mr. Asanka Gunawardana",
                image: "https://source.unsplash.com/random/600x400/?cloud,aws,server",
                duration: "2 days",
                level: "Intermediate"
            },
            {
                id: 12,
                title: "Financial Management",
                category: "business",
                date: "2023-07-22",
                description: "Learn essential financial management skills for businesses. Budgeting, forecasting, and financial analysis.",
                instructor: "Dr. Manoj Karunaratne",
                image: "https://source.unsplash.com/random/600x400/?finance,money,business",
                duration: "2 days",
                level: "Intermediate"
            }
        ]
    };

    // Enhanced workshop display with loading states and animations
    function displayWorkshops(workshops, containerId, isUpcoming = true) {
        const container = document.getElementById(containerId);
        
        // Show loading state
        container.innerHTML = '<div class="loading-container"><div class="loading"></div><p>Loading workshops...</p></div>';
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            container.innerHTML = '';
            
            if (workshops.length === 0) {
                container.innerHTML = `
                    <div class="no-workshops">
                        <i class="fas fa-search"></i>
                        <h3>No workshops found</h3>
                        <p>Try adjusting your filters or search terms.</p>
                    </div>
                `;
                return;
            }
            
            workshops.forEach((workshop, index) => {
                const workshopCard = document.createElement('div');
                workshopCard.className = 'workshop-card';
                workshopCard.style.animationDelay = `${index * 0.1}s`;
                
                const formattedDate = new Date(workshop.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                const daysUntil = Math.ceil((new Date(workshop.date) - new Date()) / (1000 * 60 * 60 * 24));
                const dateStatus = daysUntil > 0 ? `${daysUntil} days away` : 'Today';
                
                workshopCard.innerHTML = `
                    <div class="workshop-image">
                        <img src="${workshop.image}" alt="${workshop.title}" loading="lazy">
                        <div class="workshop-overlay">
                            <span class="workshop-duration"><i class="fas fa-clock"></i> ${workshop.duration}</span>
                            <span class="workshop-level"><i class="fas fa-signal"></i> ${workshop.level}</span>
                        </div>
                    </div>
                    <div class="workshop-content">
                        <span class="workshop-category ${workshop.category}">
                            <i class="fas fa-${getCategoryIcon(workshop.category)}"></i>
                            ${workshop.category.charAt(0).toUpperCase() + workshop.category.slice(1)}
                        </span>
                        <h3 class="workshop-title">${workshop.title}</h3>
                        <div class="workshop-date">
                            <i class="far fa-calendar-alt"></i>
                            ${formattedDate}
                            ${isUpcoming ? `<span class="date-status">${dateStatus}</span>` : ''}
                        </div>
                        <p class="workshop-description">${workshop.description}</p>
                        <div class="workshop-footer">
                            <div class="workshop-instructor">
                                <img src="https://source.unsplash.com/random/100x100/?portrait,${workshop.instructor.split(' ')[0]}" alt="${workshop.instructor}" loading="lazy">
                                <span>${workshop.instructor}</span>
                            </div>
                            ${isUpcoming ? 
                                `<button class="btn btn-success" onclick="registerWorkshop(${workshop.id})">
                                    <i class="fas fa-user-plus"></i> Register
                                </button>` : 
                                `<button class="btn btn-outline" disabled>
                                    <i class="fas fa-check-circle"></i> Completed
                                </button>`
                            }
                        </div>
                    </div>
                `;
                
                container.appendChild(workshopCard);
            });
        }, 500);
    }

    // Get category icon
    function getCategoryIcon(category) {
        const icons = {
            technology: 'laptop-code',
            business: 'briefcase',
            design: 'palette',
            research: 'microscope'
        };
        return icons[category] || 'book';
    }

    // Enhanced filter function with debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function filterWorkshops(workshops, category, searchTerm = '') {
        return workshops.filter(workshop => {
            const matchesCategory = category === 'all' || workshop.category === category;
            const matchesSearch = searchTerm === '' || 
                workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                workshop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workshop.instructor.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    // Initial display with animation
    displayWorkshops(workshops.upcoming, 'upcomingWorkshops');
    displayWorkshops(workshops.past, 'pastWorkshops', false);

    // Enhanced filter event listeners with debouncing
    document.getElementById('upcomingFilter').addEventListener('change', function() {
        const filtered = filterWorkshops(workshops.upcoming, this.value);
        displayWorkshops(filtered, 'upcomingWorkshops');
    });

    document.getElementById('pastFilter').addEventListener('change', function() {
        const searchTerm = document.getElementById('pastSearch').value;
        const filtered = filterWorkshops(workshops.past, this.value, searchTerm);
        displayWorkshops(filtered, 'pastWorkshops', false);
    });

    const debouncedSearch = debounce(function() {
        const category = document.getElementById('pastFilter').value;
        const searchTerm = document.getElementById('pastSearch').value;
        const filtered = filterWorkshops(workshops.past, category, searchTerm);
        displayWorkshops(filtered, 'pastWorkshops', false);
    }, 300);

    document.getElementById('pastSearch').addEventListener('input', debouncedSearch);

    // Enhanced smooth scrolling with offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    body.style.overflow = '';
                    menuToggle.querySelector('i').className = 'fas fa-bars';
                }
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe workshop cards for animation
    document.addEventListener('DOMContentLoaded', function() {
        const cards = document.querySelectorAll('.workshop-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    });

    // Global function for workshop registration
    window.registerWorkshop = function(workshopId) {
        const workshop = workshops.upcoming.find(w => w.id === workshopId);
        if (workshop) {
            // Show registration modal or notification
            alert(`Registration successful for "${workshop.title}"! You will receive a confirmation email shortly.`);
        }
    };

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            nav.classList.remove('active');
            body.style.overflow = '';
            menuToggle.querySelector('i').className = 'fas fa-bars';
        }
    });

    // Add loading animation for images
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        });
    });

    // Scroll to top functionality
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
