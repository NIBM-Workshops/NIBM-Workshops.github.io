document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('nav');
    
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
    });

    // Sample workshop data
    const workshops = {
        upcoming: [
            {
                id: 1,
                title: "Advanced Web Development with React",
                category: "technology",
                date: "2023-12-15",
                description: "Learn to build modern web applications using React, Redux, and React Router.",
                instructor: "Dr. Sanjaya Gamage",
                image: "https://source.unsplash.com/random/600x400/?web,development"
            },
            {
                id: 2,
                title: "Data Science Fundamentals",
                category: "technology",
                date: "2023-12-20",
                description: "Introduction to data science concepts with Python and Jupyter notebooks.",
                instructor: "Prof. Nimal Perera",
                image: "https://source.unsplash.com/random/600x400/?data,science"
            },
            {
                id: 3,
                title: "Digital Marketing Strategies",
                category: "business",
                date: "2024-01-05",
                description: "Learn effective digital marketing techniques for the modern business landscape.",
                instructor: "Ms. Anoma Silva",
                image: "https://source.unsplash.com/random/600x400/?marketing,digital"
            },
            {
                id: 4,
                title: "UI/UX Design Principles",
                category: "design",
                date: "2024-01-15",
                description: "Master the fundamentals of user interface and user experience design.",
                instructor: "Mr. Kamal Fernando",
                image: "https://source.unsplash.com/random/600x400/?design,ui"
            }
        ],
        past: [
            {
                id: 5,
                title: "Python Programming Basics",
                category: "technology",
                date: "2023-10-10",
                description: "Introduction to Python programming for beginners.",
                instructor: "Dr. Sunil Rathnayake",
                image: "https://source.unsplash.com/random/600x400/?python,code"
            },
            {
                id: 6,
                title: "Entrepreneurship Workshop",
                category: "business",
                date: "2023-09-20",
                description: "Learn how to start and grow your own business.",
                instructor: "Mr. Rajitha Kuruppu",
                image: "https://source.unsplash.com/random/600x400/?business,entrepreneur"
            },
            {
                id: 7,
                title: "Graphic Design Fundamentals",
                category: "design",
                date: "2023-08-15",
                description: "Introduction to graphic design using Adobe tools.",
                instructor: "Ms. Priyanka Bandara",
                image: "https://source.unsplash.com/random/600x400/?graphic,design"
            },
            {
                id: 8,
                title: "Academic Research Methods",
                category: "research",
                date: "2023-07-05",
                description: "Learn proper research methodologies for academic writing.",
                instructor: "Dr. Harsha Wijayawardhana",
                image: "https://source.unsplash.com/random/600x400/?research,books"
            },
            {
                id: 9,
                title: "Cloud Computing with AWS",
                category: "technology",
                date: "2023-06-18",
                description: "Introduction to cloud computing using Amazon Web Services.",
                instructor: "Mr. Asanka Gunawardana",
                image: "https://source.unsplash.com/random/600x400/?cloud,aws"
            },
            {
                id: 10,
                title: "Financial Management",
                category: "business",
                date: "2023-05-22",
                description: "Learn essential financial management skills for businesses.",
                instructor: "Dr. Manoj Karunaratne",
                image: "https://source.unsplash.com/random/600x400/?finance,money"
            }
        ]
    };

    // Display workshops
    function displayWorkshops(workshops, containerId, isUpcoming = true) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        workshops.forEach(workshop => {
            const workshopCard = document.createElement('div');
            workshopCard.className = 'workshop-card';
            
            const formattedDate = new Date(workshop.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            workshopCard.innerHTML = `
                <div class="workshop-image">
                    <img src="${workshop.image}" alt="${workshop.title}">
                </div>
                <div class="workshop-content">
                    <span class="workshop-category ${workshop.category}">${workshop.category.charAt(0).toUpperCase() + workshop.category.slice(1)}</span>
                    <h3 class="workshop-title">${workshop.title}</h3>
                    <div class="workshop-date">
                        <i class="far fa-calendar-alt"></i>
                        ${formattedDate}
                    </div>
                    <p class="workshop-description">${workshop.description}</p>
                    <div class="workshop-footer">
                        <div class="workshop-instructor">
                            <img src="https://source.unsplash.com/random/100x100/?portrait,${workshop.instructor.split(' ')[0]}" alt="${workshop.instructor}">
                            <span>${workshop.instructor}</span>
                        </div>
                        ${isUpcoming ? '<button class="btn">Register</button>' : '<button class="btn" disabled>Completed</button>'}
                    </div>
                </div>
            `;
            
            container.appendChild(workshopCard);
        });
    }

    // Filter workshops
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

    // Initial display
    displayWorkshops(workshops.upcoming, 'upcomingWorkshops');
    displayWorkshops(workshops.past, 'pastWorkshops', false);

    // Filter event listeners
    document.getElementById('upcomingFilter').addEventListener('change', function() {
        const filtered = filterWorkshops(workshops.upcoming, this.value);
        displayWorkshops(filtered, 'upcomingWorkshops');
    });

    document.getElementById('pastFilter').addEventListener('change', function() {
        const searchTerm = document.getElementById('pastSearch').value;
        const filtered = filterWorkshops(workshops.past, this.value, searchTerm);
        displayWorkshops(filtered, 'pastWorkshops', false);
    });

    document.getElementById('pastSearch').addEventListener('input', function() {
        const category = document.getElementById('pastFilter').value;
        const filtered = filterWorkshops(workshops.past, category, this.value);
        displayWorkshops(filtered, 'pastWorkshops', false);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                nav.classList.remove('active');
            }
        });
    });
});
