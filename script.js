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

    // GitHub API configuration
    const GITHUB_API_BASE = 'https://api.github.com';
    const ORGANIZATION = 'NIBM-Workshops';
    
    // Workshop data structure
    let workshops = {
        upcoming: [],
        past: []
    };

    // Fetch repositories from GitHub organization
    async function fetchRepositories() {
        try {
            const response = await fetch(`${GITHUB_API_BASE}/orgs/${ORGANIZATION}/repos?per_page=100&sort=updated`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'NIBM-Workshops-Website'
                }
            });
            
            console.log('GitHub API Response Status:', response.status);
            console.log('GitHub API Response Headers:', response.headers);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('GitHub API Error Response:', errorText);
                
                // Check if it's a rate limit error
                if (response.status === 403 && errorText.includes('rate limit')) {
                    console.log('Rate limit exceeded, using fallback repository list');
                    return getFallbackRepositories();
                }
                
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const repos = await response.json();
            console.log('Fetched repositories:', repos.map(r => r.name));
            return repos;
        } catch (error) {
            console.error('Error fetching repositories:', error);
            console.log('Using fallback repository list due to error');
            return getFallbackRepositories();
        }
    }

    // Fallback repository list when GitHub API is rate limited
    function getFallbackRepositories() {
        console.log('Using fallback repository list');
        return [
            { name: 'Git-Github' },
            { name: 'NIBM-Workshops.github.io' }
            // Add more repositories as needed
        ];
    }

    // Function to manually add a repository to test
    window.addRepositoryToTest = function(repoName) {
        console.log(`Adding repository to test: ${repoName}`);
        const testRepo = { name: repoName };
        const testWorkshop = parseWorkshopFromReadme('', repoName); // Will fetch README separately
        console.log(`Test workshop object for ${repoName}:`, testWorkshop);
        
        // Fetch README for this specific repository
        fetchReadme(repoName).then(content => {
            if (content) {
                const workshop = parseWorkshopFromReadme(content, repoName);
                console.log(`Parsed workshop for ${repoName}:`, workshop);
                
                // Add to workshops list
                if (workshop.category === 'upcoming') {
                    workshops.upcoming.push(workshop);
                } else {
                    workshops.past.push(workshop);
                }
                
                // Refresh display
                displayWorkshops(workshops.upcoming, 'upcomingWorkshops');
                displayWorkshops(workshops.past, 'pastWorkshops', false);
            }
        });
    };

    // Fetch README content from a repository using raw GitHub URL
    async function fetchReadme(repoName) {
        try {
            // Try main branch first
            let rawUrl = `https://raw.githubusercontent.com/${ORGANIZATION}/${repoName}/main/README.md`;
            console.log(`Fetching README from: ${rawUrl}`);
            
            let response = await fetch(rawUrl);
            
            // If main branch doesn't work, try master branch
            if (!response.ok) {
                console.log(`Main branch failed, trying master branch for ${repoName}`);
                rawUrl = `https://raw.githubusercontent.com/${ORGANIZATION}/${repoName}/master/README.md`;
                response = await fetch(rawUrl);
            }
            
            // If still not found, try README.md in root
            if (!response.ok) {
                console.log(`Master branch failed, trying root README for ${repoName}`);
                rawUrl = `https://raw.githubusercontent.com/${ORGANIZATION}/${repoName}/README.md`;
                response = await fetch(rawUrl);
            }
            
            if (!response.ok) {
                console.log(`No README found for ${repoName} (Status: ${response.status})`);
                return null;
            }
            
            const content = await response.text();
            console.log(`README content for ${repoName}:`, content.substring(0, 200) + '...');
            return content;
        } catch (error) {
            console.error(`Error fetching README for ${repoName}:`, error);
            return null;
        }
    }

    // Parse workshop information from README content
    function parseWorkshopFromReadme(readmeContent, repoName) {
        const workshop = {
            id: repoName,
            title: repoName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: 'technology', // default category
            date: null,
            description: '',
            instructor: '',
            image: `https://source.unsplash.com/random/600x400/?${repoName}`,
            duration: '1 day',
            level: 'All Levels',
            repoUrl: `https://github.com/${ORGANIZATION}/${repoName}`,
            readmeUrl: `https://github.com/${ORGANIZATION}/${repoName}#readme`,
            whyAttend: [],
            featuredExperts: [],
            hostedBy: '',
            registrationLink: ''
        };

        // Extract workshop title from the first heading
        const titleMatch = readmeContent.match(/^#\s+(.+?)(?:\s*🚀)?$/m);
        if (titleMatch) {
            workshop.title = titleMatch[1].trim();
        }

        // Extract description from the first paragraph after the title
        const descriptionMatch = readmeContent.match(/\*\*(.+?)\*\*\s*(.+?)(?=\n\n|\n##|\n#)/s);
        if (descriptionMatch) {
            workshop.description = (descriptionMatch[1] + ' ' + descriptionMatch[2]).trim();
        }

        // Extract image from markdown image syntax
        const imageMatch = readmeContent.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
        if (imageMatch) {
            workshop.image = imageMatch[1];
        }

        // Extract featured experts
        const expertsMatch = readmeContent.match(/## 👨‍💻 Featured Experts\s*\n((?:- \*\*.*?\*\*.*?\n?)+)/s);
        if (expertsMatch) {
            const expertsText = expertsMatch[1];
            const expertMatches = expertsText.matchAll(/- \*\*(.*?)\*\* \((.*?)\)/g);
            for (const match of expertMatches) {
                workshop.featuredExperts.push({
                    name: match[1].trim(),
                    role: match[2].trim()
                });
            }
            // Set the first expert as the main instructor
            if (workshop.featuredExperts.length > 0) {
                workshop.instructor = workshop.featuredExperts[0].name;
            }
        }

        // Extract "Why Attend" points
        const whyAttendMatch = readmeContent.match(/## 🔥 Why Attend\?\s*\n((?:- \*\*.*?\*\*.*?\n?)+)/s);
        if (whyAttendMatch) {
            const whyAttendText = whyAttendMatch[1];
            const pointMatches = whyAttendText.matchAll(/- \*\*(.*?)\*\* (.*?)(?=\n-|\n$)/g);
            for (const match of pointMatches) {
                workshop.whyAttend.push({
                    title: match[1].trim(),
                    description: match[2].trim()
                });
            }
        }

        // Extract hosted by information
        const hostedByMatch = readmeContent.match(/## 📍 Hosted by\s*\n\*\*(.*?)\*\*/s);
        if (hostedByMatch) {
            workshop.hostedBy = hostedByMatch[1].trim();
        }

        // Extract registration link
        const registrationMatch = readmeContent.match(/\[Register Now\]\((https?:\/\/[^\s)]+)\)/);
        if (registrationMatch) {
            workshop.registrationLink = registrationMatch[1];
        }

        // Extract date from various patterns in the content
        const datePatterns = [
            /(\w{3}\s+\d{1,2},?\s+\d{4})/i, // Aug 12, 2025
            /(\d{4}-\d{2}-\d{2})/, // 2025-08-12
            /(\d{1,2}\/\d{1,2}\/\d{4})/, // 12/08/2025
            /(\d{1,2}\s+\w{3}\s+\d{4})/i, // 12 Aug 2025
        ];

        for (const pattern of datePatterns) {
            const match = readmeContent.match(pattern);
            if (match) {
                try {
                    const date = new Date(match[1]);
                    if (!isNaN(date.getTime())) {
                        workshop.date = date.toISOString().split('T')[0];
                        break;
                    }
                } catch (e) {
                    // Continue to next pattern
                }
            }
        }

        // Extract duration from content (look for patterns like "3 hours", "2 days", etc.)
        const durationMatch = readmeContent.match(/(\d+)\s+(hours?|days?|weeks?)/i);
        if (durationMatch) {
            const number = durationMatch[1];
            const unit = durationMatch[2].toLowerCase();
            workshop.duration = `${number} ${unit}`;
        }

        // Extract level from content
        if (readmeContent.toLowerCase().includes('beginner')) {
            workshop.level = 'Beginner';
        } else if (readmeContent.toLowerCase().includes('intermediate')) {
            workshop.level = 'Intermediate';
        } else if (readmeContent.toLowerCase().includes('advanced')) {
            workshop.level = 'Advanced';
        } else {
            workshop.level = 'All Levels';
        }

        // Determine category based on content
        const content = readmeContent.toLowerCase();
        if (content.includes('git') || content.includes('version control') || content.includes('programming')) {
            workshop.category = 'technology';
        } else if (content.includes('business') || content.includes('management') || content.includes('marketing')) {
            workshop.category = 'business';
        } else if (content.includes('design') || content.includes('ui') || content.includes('ux')) {
            workshop.category = 'design';
        } else if (content.includes('research') || content.includes('academic')) {
            workshop.category = 'research';
        }

        // If no description found, use a default one
        if (!workshop.description) {
            workshop.description = `Join our ${workshop.title} workshop to enhance your skills and knowledge.`;
        }

        // If no instructor found, use a default one
        if (!workshop.instructor) {
            workshop.instructor = 'NIBM Expert';
        }

        // Determine if workshop is upcoming or past
        if (workshop.date) {
            const workshopDate = new Date(workshop.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (workshopDate >= today) {
                workshop.category = 'upcoming';
            } else {
                workshop.category = 'past';
            }
        } else {
            // If no date found, assume it's upcoming
            workshop.category = 'upcoming';
            workshop.date = new Date().toISOString().split('T')[0];
        }

        return workshop;
    }

    // Load workshops from GitHub repositories
    async function loadWorkshopsFromGitHub() {
        const upcomingContainer = document.getElementById('upcomingWorkshops');
        const pastContainer = document.getElementById('pastWorkshops');

        // Show loading state
        upcomingContainer.innerHTML = '<div class="loading-container"><div class="loading"></div><p>Loading workshops from GitHub...</p></div>';
        pastContainer.innerHTML = '<div class="loading-container"><div class="loading"></div><p>Loading past workshops...</p></div>';

        try {
            console.log('Starting to fetch repositories from GitHub...');
            const repos = await fetchRepositories();
            
            if (repos.length === 0) {
                console.log('No repositories found');
                upcomingContainer.innerHTML = `
                    <div class="no-workshops">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>No repositories found</h3>
                        <p>Unable to load workshops from GitHub. Please check your internet connection.</p>
                    </div>
                `;
                pastContainer.innerHTML = `
                    <div class="no-workshops">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>No repositories found</h3>
                        <p>Unable to load workshops from GitHub. Please check your internet connection.</p>
                    </div>
                `;
                return;
            }

            console.log(`Found ${repos.length} repositories, fetching README files...`);

            // Fetch README for each repository
            const workshopPromises = repos.map(async (repo) => {
                console.log(`Fetching README for repository: ${repo.name}`);
                const readmeContent = await fetchReadme(repo.name);
                if (readmeContent) {
                    const workshop = parseWorkshopFromReadme(readmeContent, repo.name);
                    console.log(`Parsed workshop for ${repo.name}:`, workshop);
                    return workshop;
                }
                console.log(`No README content found for ${repo.name}`);
                return null;
            });

            const workshopResults = await Promise.all(workshopPromises);
            const validWorkshops = workshopResults.filter(workshop => workshop !== null);
            
            console.log(`Successfully parsed ${validWorkshops.length} workshops:`, validWorkshops);

            // Separate upcoming and past workshops
            workshops.upcoming = validWorkshops.filter(workshop => workshop.category === 'upcoming');
            workshops.past = validWorkshops.filter(workshop => workshop.category === 'past');

            console.log(`Upcoming workshops: ${workshops.upcoming.length}`, workshops.upcoming);
            console.log(`Past workshops: ${workshops.past.length}`, workshops.past);

            // Display workshops
            displayWorkshops(workshops.upcoming, 'upcomingWorkshops');
            displayWorkshops(workshops.past, 'pastWorkshops', false);

        } catch (error) {
            console.error('Error loading workshops:', error);
            upcomingContainer.innerHTML = `
                <div class="no-workshops">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading workshops</h3>
                    <p>There was an error loading workshops from GitHub. Please try again later.</p>
                    <p><small>Error: ${error.message}</small></p>
                </div>
            `;
            pastContainer.innerHTML = `
                <div class="no-workshops">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading workshops</h3>
                    <p>There was an error loading workshops from GitHub. Please try again later.</p>
                    <p><small>Error: ${error.message}</small></p>
                </div>
            `;
        }
    }

    // Enhanced workshop display with loading states and animations
    function displayWorkshops(workshops, containerId, isUpcoming = true) {
        const container = document.getElementById(containerId);
            
            if (workshops.length === 0) {
                container.innerHTML = `
                    <div class="no-workshops">
                        <i class="fas fa-search"></i>
                        <h3>No workshops found</h3>
                    <p>${isUpcoming ? 'No upcoming workshops scheduled at the moment.' : 'No past workshops found.'}</p>
                    </div>
                `;
                return;
            }
        
        container.innerHTML = '';
            
            workshops.forEach((workshop, index) => {
                const workshopCard = document.createElement('div');
                workshopCard.className = 'workshop-card';
                workshopCard.style.animationDelay = `${index * 0.1}s`;
                
            const formattedDate = workshop.date ? new Date(workshop.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
            }) : 'TBD';
                
            const daysUntil = workshop.date ? Math.ceil((new Date(workshop.date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            const dateStatus = daysUntil !== null ? (daysUntil > 0 ? `${daysUntil} days away` : 'Today') : '';
                
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
                        ${isUpcoming && dateStatus ? `<span class="date-status">${dateStatus}</span>` : ''}
                    </div>
                    <p class="workshop-description">${workshop.description}</p>
                    ${workshop.featuredExperts.length > 0 ? `
                        <div class="workshop-experts">
                            <strong><i class="fas fa-users"></i> Featured Experts:</strong>
                            ${workshop.featuredExperts.map(expert => 
                                `<span class="expert-tag">${expert.name} (${expert.role})</span>`
                            ).join(', ')}
                        </div>
                    ` : ''}
                    ${workshop.whyAttend.length > 0 ? `
                        <div class="workshop-highlights">
                            <strong><i class="fas fa-star"></i> Key Benefits:</strong>
                            <ul>
                                ${workshop.whyAttend.slice(0, 2).map(point => 
                                    `<li>${point.title}: ${point.description}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                        <div class="workshop-footer">
                            <div class="workshop-instructor">
                                <img src="https://source.unsplash.com/random/100x100/?portrait,${workshop.instructor.split(' ')[0]}" alt="${workshop.instructor}" loading="lazy">
                                <span>${workshop.instructor}</span>
                            </div>
                        <div class="workshop-actions">
                            ${isUpcoming ? 
                                (workshop.registrationLink ? 
                                    `<a href="${workshop.registrationLink}" class="btn btn-success" target="_blank" rel="noopener">
                                        <i class="fas fa-user-plus"></i> Register Now
                                    </a>` :
                                    `<button class="btn btn-success" onclick="registerWorkshop('${workshop.id}')">
                                    <i class="fas fa-user-plus"></i> Register
                                    </button>`
                                ) : 
                                `<button class="btn btn-outline" disabled>
                                    <i class="fas fa-check-circle"></i> Completed
                                </button>`
                            }
                            <a href="${workshop.repoUrl}" class="btn btn-outline" target="_blank" rel="noopener">
                                <i class="fab fa-github"></i> View Details
                            </a>
                        </div>
                        </div>
                    </div>
                `;
                
                container.appendChild(workshopCard);
            });
    }

    // Get category icon
    function getCategoryIcon(category) {
        const icons = {
            technology: 'laptop-code',
            business: 'briefcase',
            design: 'palette',
            research: 'microscope',
            upcoming: 'calendar-alt',
            past: 'history'
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

    // Load workshops from GitHub on page load
    loadWorkshopsFromGitHub();
    
    // Add a refresh button for manual reloading
    window.refreshWorkshops = function() {
        console.log('Manually refreshing workshops...');
        loadWorkshopsFromGitHub();
    };

    // Test function specifically for Git-Github repository
    window.testGitGithubReadme = async function() {
        console.log('Testing Git-Github README fetch...');
        try {
            const rawUrl = 'https://raw.githubusercontent.com/NIBM-Workshops/Git-Github/main/README.md';
            console.log('Fetching from:', rawUrl);
            
            const response = await fetch(rawUrl);
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const content = await response.text();
                console.log('Git-Github README content:', content);
                
                // Test parsing
                const workshop = parseWorkshopFromReadme(content, 'Git-Github');
                console.log('Parsed workshop data:', workshop);
                
                return workshop;
            } else {
                console.error('Failed to fetch Git-Github README:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error testing Git-Github README:', error);
            return null;
        }
    };

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

    // Debug function to test GitHub API and raw README fetching
    window.testGitHubAPI = async function() {
        console.log('Testing GitHub API connection...');
        try {
            const response = await fetch(`${GITHUB_API_BASE}/orgs/${ORGANIZATION}/repos`);
            console.log('GitHub API Response:', response);
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            // Check rate limit headers
            const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
            const rateLimitReset = response.headers.get('x-ratelimit-reset');
            console.log('Rate limit remaining:', rateLimitRemaining);
            console.log('Rate limit reset time:', rateLimitReset);
            
            if (response.ok) {
                const repos = await response.json();
                console.log('Repositories found:', repos);
                
                if (repos.length > 0) {
                    const firstRepo = repos[0];
                    console.log('Testing README fetch for first repo:', firstRepo.name);
                    
                    // Test raw GitHub URL approach
                    const rawUrl = `https://raw.githubusercontent.com/${ORGANIZATION}/${firstRepo.name}/main/README.md`;
                    console.log('Testing raw URL:', rawUrl);
                    
                    const readmeResponse = await fetch(rawUrl);
                    console.log('Raw README Response:', readmeResponse);
                    
                    if (readmeResponse.ok) {
                        const content = await readmeResponse.text();
                        console.log('Raw README content:', content.substring(0, 500) + '...');
                    } else {
                        console.log('README not found for', firstRepo.name);
                    }
                }
            } else {
                const errorText = await response.text();
                console.error('GitHub API error:', response.status, response.statusText);
                console.error('Error details:', errorText);
                
                if (response.status === 403) {
                    console.log('Rate limit exceeded. Using fallback repositories.');
                    const fallbackRepos = getFallbackRepositories();
                    console.log('Fallback repositories:', fallbackRepos);
                }
            }
        } catch (error) {
            console.error('GitHub API test failed:', error);
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
