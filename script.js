document.addEventListener('DOMContentLoaded', function() {

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

    // Configuration des graphiques
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
                data: [100, 100, 100, 100, 100], // Maximum atteignable
                backgroundColor: 'rgba(255, 255, 255, 0.1)', // Rendu plus transparent
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.3)' }, // Rendu plus visible
                    grid: { color: 'rgba(255, 255, 255, 0.3)' }, // Rendu plus visible
                    pointLabels: {
                        color: '#FFFFFF', // Couleur du texte en blanc
                        font: {
                            size: 14, // Augmentation de la taille de la police
                            weight: 'bold' // Mettre le texte en gras pour une meilleure lisibilité
                        },
                        backdropColor: 'rgba(0, 0, 0, 0.4)', // Ajout d'un fond derrière le texte pour le faire ressortir
                        backdropPadding: 4 // Espace autour du texte
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

    // Gestion des cases à cocher pour les prérequis
    const prerequisList = document.getElementById('prerequis-list');
    const prerequisCheckboxes = prerequisList.querySelectorAll('input[type="checkbox"]');
    const prerequisKey = 'chanbara_prerequis';

    // Chargement de l'état des cases à cocher
    if (localStorage.getItem(prerequisKey)) {
        const savedStates = JSON.parse(localStorage.getItem(prerequisKey));
        prerequisCheckboxes.forEach((checkbox, index) => {
            checkbox.checked = savedStates[index] || false;
        });
    }

    // Sauvegarde de l'état des cases à cocher à chaque changement
    prerequisCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const currentStates = Array.from(prerequisCheckboxes).map(cb => cb.checked);
            localStorage.setItem(prerequisKey, JSON.stringify(currentStates));
        });
    });
})