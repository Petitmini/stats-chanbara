document.addEventListener('DOMContentLoaded', function() {
    
    // NAVIGATION EN PAGE COMPLÈTE
    let currentSectionIndex = 0;
    const sections = document.querySelectorAll('#fullpage-wrapper section');
    const totalSections = sections.length;
    const wrapper = document.getElementById('fullpage-wrapper');
    let isScrolling = false;
    
    // NAVIGATION AVEC MENU LATÉRAL
    const menuItems = document.querySelectorAll('#sidebar-menu li');

    // Fonction pour mettre à jour la classe "active" du menu
    function updateMenuActive(index) {
        menuItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Fonction pour aller à une section spécifique
    function goToSection(index) {
        if (index >= 0 && index < totalSections) {
            currentSectionIndex = index;
            const translateY = -currentSectionIndex * 100;
            wrapper.style.transform = `translateY(${translateY}vh)`;
            updateMenuActive(currentSectionIndex);
        }
    }

    // Gérer l'événement de défilement de la souris
    window.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        isScrolling = true;

        if (e.deltaY > 0) {
            goToSection(currentSectionIndex + 1);
        } else {
            goToSection(currentSectionIndex - 1);
        }

        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    });

    // Gérer les clics sur le menu latéral
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionIndex = parseInt(this.getAttribute('data-section'));
            goToSection(sectionIndex);
        });
    });

    // Initialisation
    goToSection(0);
    
    // FIN NAVIGATION EN PAGE COMPLÈTE

    const dataUrl = 'assets/data/progression.csv';

    let statsData = {
        labels: ['Explosivite', 'Technicite', 'Strategie', 'Endurance', 'Vitesse'],
        values: []
    };
    
    let progressionData = {
        labels: [],
        datasets: [{
            label: 'Vitesse',
            data: [],
            borderColor: '#E04040',
            tension: 0.4
        }]
    };

    const statsConfig = {
        type: 'radar',
        data: {
            labels: statsData.labels,
            datasets: [{
                label: 'Statistiques',
                data: statsData.values,
                backgroundColor: 'rgba(224, 64, 64, 0.4)',
                borderColor: '#E04040',
                borderWidth: 2,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#E04040',
                pointHoverBackgroundColor: '#E04040'
            }, {
                label: 'Max',
                data: [100, 100, 100, 100, 100],
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.3)' },
                    grid: { color: 'rgba(255, 255, 255, 0.3)' },
                    pointLabels: {
                        color: '#FFFFFF',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        backdropColor: 'rgba(0, 0, 0, 0.4)',
                        backdropPadding: 4
                    },
                    ticks: { display: false, beginAtZero: true }
                }
            },
            plugins: {
                legend: { display: false },
            }
        }
    };

    const progressionConfig = {
        type: 'line',
        data: progressionData,
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    ticks: { color: '#FFFFFF' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    ticks: { color: '#FFFFFF' }
                }
            },
            plugins: {
                legend: { display: false },
            }
        }
    };
    
    async function fetchData() {
        try {
            const response = await fetch(dataUrl);
            const text = await response.text();
            
            const rows = text.split('\n').filter(row => row.trim() !== '').slice(1);
            
            const lastRow = rows[rows.length - 1];
            const latestValues = lastRow.split(',').slice(1).map(Number);
            statsData.values = latestValues;

            statsChart.data.datasets[0].data = statsData.values;
            statsChart.update();

            rows.forEach(row => {
                const [date, ...values] = row.split(',');
                if (date) {
                    progressionData.labels.push(date);
                    progressionData.datasets[0].data.push(Number(values[4]));
                }
            });
            progressionChart.update();

        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
        }
    }

    const notesArea = document.getElementById('notes-area');
    const saveNotesBtn = document.getElementById('save-notes-btn');
    const notesKey = 'chanbara_notes';

    saveNotesBtn.addEventListener('click', function() {
        localStorage.setItem(notesKey, notesArea.value);
        alert('Notes sauvegardées !');
    });

    if (localStorage.getItem(notesKey)) {
        notesArea.value = localStorage.getItem(notesKey);
    }
    
    const ctxStats = document.getElementById('stats-chart').getContext('2d');
    const statsChart = new Chart(ctxStats, statsConfig);
    const ctxProgression = document.getElementById('progression-chart').getContext('2d');
    const progressionChart = new Chart(ctxProgression, progressionConfig);

    fetchData();

    // Gestion des cases à cocher pour les prérequis
    const prerequisList = document.getElementById('prerequis-list');
    const prerequisCheckboxes = prerequisList.querySelectorAll('input[type="checkbox"]');
    const prerequisKey = 'chanbara_prerequis';

    if (localStorage.getItem(prerequisKey)) {
        const savedStates = JSON.parse(localStorage.getItem(prerequisKey));
        prerequisCheckboxes.forEach((checkbox, index) => {
            checkbox.checked = savedStates[index] || false;
        });
    }

    prerequisCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const currentStates = Array.from(prerequisCheckboxes).map(cb => cb.checked);
            localStorage.setItem(prerequisKey, JSON.stringify(currentStates));
        });
    });

});