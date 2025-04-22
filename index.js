    // Modèle mathématique - équation différentielle pour l'épargne
    function dEpargne(epargne, tauxMensuel, depotMensuel, retraitMensuel) {
    // dE/dt = r*E + d - w (où r est le taux, d les dépôts et w les retraits)
    return tauxMensuel * epargne + depotMensuel - retraitMensuel;
}

// Méthode d'Euler pour l'intégration numérique
function euler(epargneInitiale, tauxMensuel, depotMensuel, retraitMensuel, dureeEnMois, pasEnMois = 1) {
    const resultats = [];
    let epargne = epargneInitiale;
    let interetsCumules = 0;
    let depotsCumules = 0;
    let retraitsCumules = 0;
    
    resultats.push({
        mois: 0,
        epargne: epargne,
        interetsCumules: interetsCumules,
        depotsCumules: depotsCumules,
        retraitsCumules: retraitsCumules
    });
    
    for (let mois = pasEnMois; mois <= dureeEnMois; mois += pasEnMois) {
        const interetMensuel = tauxMensuel * epargne;
        interetsCumules += interetMensuel;
        depotsCumules += depotMensuel;
        retraitsCumules += retraitMensuel;
        
        epargne += dEpargne(epargne, tauxMensuel, depotMensuel, retraitMensuel) * pasEnMois;
        epargne = Math.max(0, epargne); // Éviter les valeurs négatives
        
        if (mois % 12 === 0 || mois === dureeEnMois) {
            resultats.push({
                mois: mois,
                epargne: epargne,
                interetsCumules: interetsCumules,
                depotsCumules: depotsCumules,
                retraitsCumules: retraitsCumules
            });
        }
    }
    
    return resultats;
}

// Méthode de Runge-Kutta d'ordre 4 pour l'intégration numérique
function rungeKutta4(epargneInitiale, tauxMensuel, depotMensuel, retraitMensuel, dureeEnMois, pasEnMois = 1) {
    const resultats = [];
    let epargne = epargneInitiale;
    let interetsCumules = 0;
    let depotsCumules = 0;
    let retraitsCumules = 0;
    
    resultats.push({
        mois: 0,
        epargne: epargne,
        interetsCumules: interetsCumules,
        depotsCumules: depotsCumules,
        retraitsCumules: retraitsCumules
    });
    
    for (let mois = pasEnMois; mois <= dureeEnMois; mois += pasEnMois) {
        // Calcul des coefficients k1, k2, k3, k4 pour RK4
        const k1 = dEpargne(epargne, tauxMensuel, depotMensuel, retraitMensuel);
        const k2 = dEpargne(epargne + 0.5 * pasEnMois * k1, tauxMensuel, depotMensuel, retraitMensuel);
        const k3 = dEpargne(epargne + 0.5 * pasEnMois * k2, tauxMensuel, depotMensuel, retraitMensuel);
        const k4 = dEpargne(epargne + pasEnMois * k3, tauxMensuel, depotMensuel, retraitMensuel);
        
        // Mise à jour avec la moyenne pondérée des coefficients
        const delta = (k1 + 2*k2 + 2*k3 + k4) / 6 * pasEnMois;
        
        // Calcul des intérêts pour ce pas de temps
        const interetMensuel = tauxMensuel * epargne;
        interetsCumules += interetMensuel;
        depotsCumules += depotMensuel;
        retraitsCumules += retraitMensuel;
        
        epargne += delta;
        epargne = Math.max(0, epargne); // Éviter les valeurs négatives
        
        if (mois % 12 === 0 || mois === dureeEnMois) {
            resultats.push({
                mois: mois,
                epargne: epargne,
                interetsCumules: interetsCumules,
                depotsCumules: depotsCumules,
                retraitsCumules: retraitsCumules
            });
        }
    }
    
    return resultats;
}

// Calculer le dépôt mensuel nécessaire pour atteindre un objectif
function calculerDepotNecessaire(epargneInitiale, tauxMensuel, retraitMensuel, objectif, dureeEnMois, methodeIntegration = 'rk4') {
    // Utilisation d'une recherche dichotomique pour trouver le dépôt mensuel nécessaire
    let depotMin = 0;
    let depotMax = Math.max(5000, objectif / dureeEnMois); // Dépôt maximum raisonnable
    let depot = (depotMin + depotMax) / 2;
    const precision = 1; // Précision à 1Ar près
    
    while (depotMax - depotMin > precision) {
        let resultats;
        if (methodeIntegration === 'rk4') {
            resultats = rungeKutta4(epargneInitiale, tauxMensuel, depot, retraitMensuel, dureeEnMois);
        } else {
            resultats = euler(epargneInitiale, tauxMensuel, depot, retraitMensuel, dureeEnMois);
        }
        
        const epargneFinale = resultats[resultats.length - 1].epargne;
        
        if (Math.abs(epargneFinale - objectif) < precision) {
            break;
        } else if (epargneFinale < objectif) {
            depotMin = depot;
        } else {
            depotMax = depot;
        }
        
        depot = (depotMin + depotMax) / 2;
    }
    
    return Math.ceil(depot); // Arrondir au supérieur pour être sûr
}

// Variables pour stocker les résultats de simulation
let resultatSimulation = [];
let chart = null;

// Initialisation des onglets
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Fonction pour formater les valeurs monétaires
function formatMoney(amount) {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA' }).format(amount);
}


// Gestionnaire de soumission du formulaire
document.getElementById('epargneForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Récupérer les valeurs du formulaire
    const epargneInitiale = parseFloat(document.getElementById('epargneInitiale').value);
    const depotMensuel = parseFloat(document.getElementById('depotMensuel').value);
    const retraitMensuel = parseFloat(document.getElementById('retraitMensuel').value);
    const tauxAnnuel = parseFloat(document.getElementById('tauxAnnuel').value) / 100;
    const tauxMensuel = tauxAnnuel / 12;
    const dureeAnnees = parseInt(document.getElementById('dureeAnnees').value);
    const dureeEnMois = dureeAnnees * 12;
    const objectifEpargne = parseFloat(document.getElementById('objectifEpargne').value);
    const objectifAnnees = parseInt(document.getElementById('objectifAnnees').value);
    const objectifEnMois = objectifAnnees * 12;
    const methodeIntegration = document.getElementById('methodeIntegration').value;
    
    // Exécuter la simulation
    if (methodeIntegration === 'rk4') {
        resultatSimulation = rungeKutta4(epargneInitiale, tauxMensuel, depotMensuel, retraitMensuel, dureeEnMois);
    } else {
        resultatSimulation = euler(epargneInitiale, tauxMensuel, depotMensuel, retraitMensuel, dureeEnMois);
    }
    
    // Trouver si et quand l'objectif est atteint
    const moisObjectifAtteint = resultatSimulation.findIndex(r => r.epargne >= objectifEpargne);
    const objectifAtteint = moisObjectifAtteint !== -1;
    let objectifAtteinteDate = null;
    
    if (objectifAtteint) {
        const moisIndex = moisObjectifAtteint;
        objectifAtteinteDate = resultatSimulation[moisIndex].mois;
    }
    
    // Calcul du dépôt nécessaire si l'objectif n'est pas atteint dans le délai souhaité
    let depotNecessaire = depotMensuel;
    if (!objectifAtteint || objectifAtteinteDate > objectifEnMois) {
        depotNecessaire = calculerDepotNecessaire(
            epargneInitiale,
            tauxMensuel,
            retraitMensuel,
            objectifEpargne,
            objectifEnMois,
            methodeIntegration
        );
    }
    
    // Afficher un message sur l'atteinte de l'objectif
    const messageElement = document.getElementById('message');
    
    if (objectifAtteint) {
        const anneesAtteinte = Math.floor(objectifAtteinteDate / 12);
        const moisRestants = objectifAtteinteDate % 12;
        let messageTemps;
        
        if (anneesAtteinte > 0 && moisRestants > 0) {
            messageTemps = `${anneesAtteinte} an${anneesAtteinte > 1 ? 's' : ''} et ${moisRestants} mois`;
        } else if (anneesAtteinte > 0) {
            messageTemps = `${anneesAtteinte} an${anneesAtteinte > 1 ? 's' : ''}`;
        } else {
            messageTemps = `${moisRestants} mois`;
        }
        
        if (objectifAtteinteDate <= objectifEnMois) {
            messageElement.innerHTML = `
                <div class="alert alert-success">
                    Votre objectif d'épargne de ${formatMoney(objectifEpargne)} sera atteint en ${messageTemps}, 
                    ce qui est dans le délai souhaité de ${objectifAnnees} an${objectifAnnees > 1 ? 's' : ''}.
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="alert alert-warning">
                    Votre objectif d'épargne de ${formatMoney(objectifEpargne)} sera atteint en ${messageTemps}, 
                    ce qui dépasse votre délai souhaité de ${objectifAnnees} an${objectifAnnees > 1 ? 's' : ''}.
                    <br>Pour atteindre votre objectif dans le délai souhaité, vous devriez déposer ${formatMoney(depotNecessaire)} par mois.
                </div>
            `;
        }
    } else {
        messageElement.innerHTML = `
            <div class="alert alert-danger">
                Votre objectif d'épargne de ${formatMoney(objectifEpargne)} ne sera pas atteint dans les ${dureeAnnees} années simulées.
                <br>Pour atteindre votre objectif en ${objectifAnnees} an${objectifAnnees > 1 ? 's' : ''}, 
                vous devriez déposer ${formatMoney(depotNecessaire)} par mois.
            </div>
        `;
    }
    
    // Mise à jour du graphique
    updateChart(resultatSimulation, objectifEpargne, objectifEnMois);
    
    // Mise à jour du tableau
    updateTable(resultatSimulation);
    
    // Mise à jour de l'analyse
    updateAnalysis(
        resultatSimulation, 
        epargneInitiale, 
        depotMensuel, 
        retraitMensuel, 
        tauxAnnuel, 
        objectifEpargne, 
        objectifAnnees, 
        objectifAtteint, 
        objectifAtteinteDate, 
        depotNecessaire
    );
});

// Mise à jour du graphique
function updateChart(resultats, objectif, objectifMois) {
    const ctx = document.getElementById('epargneChart').getContext('2d');
    
    // Détruire le graphique précédent s'il existe
    if (chart) {
        chart.destroy();
    }
    
    // Préparer les données pour le graphique
    const labels = resultats.map(r => r.mois / 12);
    const epargneData = resultats.map(r => r.epargne);
    
    // Créer la ligne d'objectif
    const objectifData = labels.map(() => objectif);
    
    // Créer la ligne verticale pour le délai d'objectif
    const objectifDelaiData = labels.map((annee, index) => {
        return annee <= objectifMois / 12 ? null : 0;
    });
    
    // Configuration du graphique
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Épargne (Ar)',
                    data: epargneData,
                    borderColor: '#0056b3',
                    backgroundColor: 'rgba(0, 86, 179, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Objectif',
                    data: objectifData,
                    borderColor: '#28a745',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                const mois = context.label * 12;
                                const annees = Math.floor(mois / 12);
                                const moisRestants = Math.round(mois) % 12;
                                let periode = '';
                                
                                if (annees > 0 && moisRestants > 0) {
                                    periode = `${annees} an${annees > 1 ? 's' : ''} et ${moisRestants} mois`;
                                } else if (annees > 0) {
                                    periode = `${annees} an${annees > 1 ? 's' : ''}`;
                                } else {
                                    periode = `${moisRestants} mois`;
                                }
                                
                                return `Épargne après ${periode}: ${formatMoney(context.raw)}`;
                            } else {
                                return `Objectif: ${formatMoney(context.raw)}`;
                            }
                        }
                    }
                },
                legend: {
                    position: 'top',
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: objectifMois / 12,
                            xMax: objectifMois / 12,
                            borderColor: 'rgba(255, 99, 132, 0.7)',
                            borderWidth: 2,
                            label: {
                                content: 'Délai souhaité',
                                enabled: true
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Années'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Épargne (Ar)'
                    },
                    beginAtZero: true
                }
            },
            onClick: function(e, elements) {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const data = resultats[index];
                    
                    document.getElementById('pointInfo').innerHTML = `
                        <strong>Après ${Math.floor(data.mois / 12)} an${Math.floor(data.mois / 12) > 1 ? 's' : ''} et ${data.mois % 12} mois:</strong><br>
                        Épargne: ${formatMoney(data.epargne)}<br>
                        Intérêts cumulés: ${formatMoney(data.interetsCumules)}<br>
                        Dépôts cumulés: ${formatMoney(data.depotsCumules)}<br>
                        Retraits cumulés: ${formatMoney(data.retraitsCumules)}
                    `;
                }
            }
        }
    });
    
    // Afficher l'annotation du délai objectif
    const objectifMoisAnnees = objectifMois / 12;
    const canvasWidth = ctx.canvas.width;
    const xPosition = (objectifMoisAnnees / (labels[labels.length - 1])) * canvasWidth;
}

// Mise à jour du tableau
function updateTable(resultats) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    resultats.forEach(data => {
        const row = document.createElement('tr');
        
        const annees = Math.floor(data.mois / 12);
        const mois = data.mois % 12;
        let periodeText;
        
        if (data.mois === 0) {
            periodeText = 'Départ';
        } else if (mois === 0) {
            periodeText = `${annees} an${annees > 1 ? 's' : ''}`;
        } else {
            periodeText = `${annees} an${annees > 1 ? 's' : ''} et ${mois} mois`;
        }
        
        row.innerHTML = `
            <td>${periodeText}</td>
            <td>${formatMoney(data.epargne)}</td>
            <td>${formatMoney(data.interetsCumules)}</td>
            <td>${formatMoney(data.depotsCumules)}</td>
            <td>${formatMoney(data.retraitsCumules)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Mise à jour de l'analyse
function updateAnalysis(
    resultats, 
    epargneInitiale, 
    depotMensuel, 
    retraitMensuel, 
    tauxAnnuel, 
    objectif, 
    objectifAnnees, 
    objectifAtteint, 
    objectifAtteinteDate, 
    depotNecessaire
) {
    const analyseContenu = document.getElementById('analyseContenu');
    const recommandations = document.getElementById('recommandations');
    
    // Calculer des statistiques sur la simulation
    const epargneFinale = resultats[resultats.length - 1].epargne;
    const interetsCumules = resultats[resultats.length - 1].interetsCumules;
    const depotsCumules = resultats[resultats.length - 1].depotsCumules;
    const retraitsCumules = resultats[resultats.length - 1].retraitsCumules;
    const dureeAnnees = resultats[resultats.length - 1].mois / 12;
    
    // Ratio intérêts/dépôts
    const ratioInteretsDepots = interetsCumules / (depotsCumules > 0 ? depotsCumules : 1);
    
    // Analyse de rentabilité
    analyseContenu.innerHTML = `
        <p>Sur une période de ${dureeAnnees.toFixed(1)} années:</p>
        <ul>
            <li>Épargne finale : ${formatMoney(epargneFinale)}</li>
            <li>Intérêts cumulés : ${formatMoney(interetsCumules)} (${(interetsCumules / epargneFinale * 100).toFixed(1)}% de l'épargne finale)</li>
            <li>Dépôts cumulés : ${formatMoney(depotsCumules)}</li>
            
            <li>Retraits cumulés : ${formatMoney(retraitsCumules)}</li>
        </ul>
        
        <p>Pour chaque Ariary déposé, vous avez généré ${ratioInteretsDepots.toFixed(2)}Ar d'intérêts.</p>
        
        <p>Rendement effectif de votre investissement:</p>
        <div style="background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
            <strong>Taux effectif annuel moyen : ${((Math.pow(epargneFinale / epargneInitiale, 1 / dureeAnnees) - 1) * 100).toFixed(2)}%</strong>
            ${depotMensuel > 0 ? `<br>Ce taux tient compte de vos versements mensuels réguliers de ${formatMoney(depotMensuel)}.` : ''}
            ${retraitMensuel > 0 ? `<br>Ce taux tient compte de vos retraits mensuels réguliers de ${formatMoney(retraitMensuel)}.` : ''}
        </div>
    `;
    
    // Recommandations
    let recContent = '';
    
    if (objectifAtteint && objectifAtteinteDate <= objectifAnnees * 12) {
        recContent += `
            <div class="alert alert-success">
                <p>Félicitations ! Votre plan d'épargne atteint votre objectif de ${formatMoney(objectif)} dans le délai souhaité.</p>
            </div>
        `;
        
        // Si on atteint l'objectif plus tôt
        if (objectifAtteinteDate < objectifAnnees * 12) {
            const gainTemps = objectifAnnees * 12 - objectifAtteinteDate;
            const anneesGagnees = Math.floor(gainTemps / 12);
            const moisGagnes = gainTemps % 12;
            
            let tempsGagne = '';
            if (anneesGagnees > 0 && moisGagnes > 0) {
                tempsGagne = `${anneesGagnees} an${anneesGagnees > 1 ? 's' : ''} et ${moisGagnes} mois`;
            } else if (anneesGagnees > 0) {
                tempsGagne = `${anneesGagnees} an${anneesGagnees > 1 ? 's' : ''}`;
            } else {
                tempsGagne = `${moisGagnes} mois`;
            }
            
            recContent += `
                <p>Vous atteignez même votre objectif ${tempsGagne} plus tôt que prévu !</p>
                <p>Options possibles :</p>
                <ul>
                    <li>Réduire votre dépôt mensuel à environ ${formatMoney(depotMensuel * 0.8)} pour atteindre votre objectif dans le délai initial</li>
                    <li>Continuer avec votre plan actuel pour obtenir une épargne finale supérieure</li>
                    <li>Augmenter votre objectif d'épargne pour viser plus haut</li>
                </ul>
            `;
        }
        
        // Suggestion d'optimisation fiscale si l'épargne est conséquente
        if (epargneFinale > 50000) {
            recContent += `
                <p>Avec une épargne finale importante (${formatMoney(epargneFinale)}), pensez à explorer des options d'optimisation fiscale :</p>
                <ul>
                    <li>Plans d'épargne retraite</li>
                    <li>Assurance-vie</li>
                    <li>Investissements immobiliers</li>
                    <li>PEA (Plan d'Épargne en Actions)</li>
                </ul>
            `;
        }
    } else if (objectifAtteint) {
        // Objectif atteint mais pas dans le délai souhaité
        recContent += `
            <div class="alert alert-warning">
                <p>Votre plan d'épargne atteint votre objectif de ${formatMoney(objectif)}, mais pas dans le délai souhaité.</p>
            </div>
            
            <p>Pour atteindre votre objectif en ${objectifAnnees} an${objectifAnnees > 1 ? 's' : ''}, vous devriez :</p>
            <ul>
                <li>Augmenter votre dépôt mensuel à ${formatMoney(depotNecessaire)} (+ ${formatMoney(depotNecessaire - depotMensuel)})</li>
                <li>Ou chercher un placement avec un taux d'intérêt plus élevé (au moins ${(tauxAnnuel * 100 * 1.5).toFixed(2)}%)</li>
                <li>Ou diminuer les retraits mensuels si possible</li>
            </ul>
        `;
    } else {
        // Objectif non atteint
        recContent += `
            <div class="alert alert-danger">
                <p>Votre plan d'épargne n'atteint pas votre objectif de ${formatMoney(objectif)} dans la période simulée.</p>
            </div>
            
            <p>Pour atteindre votre objectif en ${objectifAnnees} an${objectifAnnees > 1 ? 's' : ''}, vous pourriez :</p>
            <ul>
                <li>Augmenter significativement votre dépôt mensuel à ${formatMoney(depotNecessaire)} (+ ${formatMoney(depotNecessaire - depotMensuel)})</li>
                <li>Chercher un placement avec un meilleur rendement (minimum recommandé : ${Math.max(tauxAnnuel * 100 * 2, 5).toFixed(2)}%)</li>
                <li>Réévaluer votre objectif d'épargne ou l'horizon temporel</li>
                <li>Réduire ou éliminer les retraits mensuels si possible</li>
            </ul>
        `;
    }
    
    // Ajouter des conseils généraux
    recContent += `
        <h4>Conseils généraux :</h4>
        <ul>
            <li>Diversifiez vos placements pour réduire les risques</li>
            <li>Constituez d'abord un fonds d'urgence équivalent à 3-6 mois de dépenses</li>
            <li>Réévaluez régulièrement votre stratégie d'épargne en fonction de votre situation personnelle</li>
            <li>Prenez en compte l'inflation dans vos projections à long terme</li>
        </ul>
    `;
    
    recommandations.innerHTML = recContent;
}

// Initialiser les graphiques, tableaux et analyses vides au chargement
// Remplacez le dispatchEvent par un appel direct à une fonction
window.addEventListener('load', function() {
    initialiserSimulation();
});

// Nouvelle fonction pour initialiser la simulation
function initialiserSimulation() {
    const epargneForm = document.getElementById('epargneForm');
    const event = new Event('submit', { cancelable: true });
    epargneForm.dispatchEvent(event);
}