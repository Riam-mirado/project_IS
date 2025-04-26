// Variables pour stocker les résultats de simulation
let resultatSimulation = [];
let chart = null;
let historiqueSimulations =
  JSON.parse(localStorage.getItem("historiqueSimulations")) || [];

// Ajouter une fonction pour sauvegarder une simulation dans l'historique
function sauvegarderSimulation(simulation) {
  historiqueSimulations.push(simulation);
  localStorage.setItem(
    "historiqueSimulations",
    JSON.stringify(historiqueSimulations),
  );
}
// Fonction pour supprimer une simulation par son index
function supprimerSimulation(index) {
  // Supprimer l'entrée du tableau
  historiqueSimulations.splice(index, 1);

  // Mettre à jour localStorage
  localStorage.setItem(
    "historiqueSimulations",
    JSON.stringify(historiqueSimulations),
  );

  // Rafraîchir l'affichage de l'historique
  afficherHistorique();
}

// Afficher l'historique des simulations
function afficherHistorique() {
  const historiqueBody = document.getElementById("historiqueBody");
  historiqueBody.innerHTML = ""; // Vider le tableau

  historiqueSimulations.forEach((simulation, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${simulation.date}</td>
            <td>${formatMoney(simulation.epargneInitiale)}</td>
            <td>${formatMoney(simulation.depotMensuel)}</td>
            <td>${simulation.tauxAnnuel.toFixed(2)}%</td>
            <td>${simulation.dureeAnnees} ans</td>
            <td>${formatMoney(simulation.objectifEpargne)}</td>
            <td><button class="delete-btn" data-index="${index}">Supprimer</button></td>
        `;
    historiqueBody.appendChild(row);
  });

  // Ajouter des écouteurs d'événements pour les boutons "Supprimer"
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const index = parseInt(this.dataset.index);
      supprimerSimulation(index); // Appeler la fonction pour supprimer l'entrée
    });
  });
}
// Fonction pour télécharger l'historique sous forme de fichier JSON
function telechargerHistorique() {
  // Créer un objet Blob contenant les données d'historique
  const historiqueJSON = JSON.stringify(historiqueSimulations, null, 2); // Formatage avec indentation
  const blob = new Blob([historiqueJSON], { type: "application/json" });

  // Créer un lien de téléchargement
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historique_simulations.json"; // Nom du fichier
  a.click();

  // Libérer l'URL créée
  URL.revokeObjectURL(url);
}

// Ajouter un bouton "Télécharger l'historique" dans le HTML
document
  .getElementById("telechargerBtn")
  .addEventListener("click", telechargerHistorique);

// Initialisation des onglets
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((t) => t.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Fonction pour formater les valeurs monétaires
function formatMoney(amount) {
  return new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
  }).format(amount);
}

// Gestionnaire de soumission du formulaire
let firstLaunch = true;
document.getElementById("epargneForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Récupérer les valeurs du formulaire
  const epargneInitiale = parseFloat(
    document.getElementById("epargneInitiale").value,
  );
  const depotMensuel = parseFloat(
    document.getElementById("depotMensuel").value,
  );
  const tauxAnnuel =
    parseFloat(document.getElementById("tauxAnnuel").value) / 100;
  const tauxMensuel = tauxAnnuel / 12;
  const dureeAnnees = parseInt(document.getElementById("dureeAnnees").value);
  const dureeEnMois = dureeAnnees * 12;
  const objectifEpargne = parseFloat(
    document.getElementById("objectifEpargne").value,
  );
  const objectifAnnees = parseInt(
    document.getElementById("objectifAnnees").value,
  );
  const objectifEnMois = objectifAnnees * 12;
  const methodeIntegration =
    document.getElementById("methodeIntegration").value;
  // Sauvegarder les paramètres de la simulation dans l'historique
  const simulation = {
    epargneInitiale,
    depotMensuel,
    tauxAnnuel,
    dureeAnnees,
    objectifEpargne,
    objectifAnnees,
    date: new Date().toLocaleString(),
  };

  if (firstLaunch) firstLaunch = false;
  else sauvegarderSimulation(simulation);

  // Mettre à jour l'affichage de l'historique
  afficherHistorique();
  // Exécuter la simulation
  if (methodeIntegration === "rk4") {
    resultatSimulation = rungeKutta4(
      epargneInitiale,
      tauxMensuel,
      depotMensuel,
      dureeEnMois,
    );
  } else {
    resultatSimulation = euler(
      epargneInitiale,
      tauxMensuel,
      depotMensuel,
      dureeEnMois,
    );
  }

  // Trouver si et quand l'objectif est atteint
  const moisObjectifAtteint = resultatSimulation.findIndex(
    (r) => r.epargne >= objectifEpargne,
  );
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
      objectifEpargne,
      objectifEnMois,
      methodeIntegration,
    );
  }

  // Afficher un message sur l'atteinte de l'objectif
  const messageElement = document.getElementById("message");

  if (objectifAtteint) {
    const anneesAtteinte = Math.floor(objectifAtteinteDate / 12);
    const moisRestants = objectifAtteinteDate % 12;
    let messageTemps;

    if (anneesAtteinte > 0 && moisRestants > 0) {
      messageTemps = `${anneesAtteinte} an${anneesAtteinte > 1 ? "s" : ""} et ${moisRestants} mois`;
    } else if (anneesAtteinte > 0) {
      messageTemps = `${anneesAtteinte} an${anneesAtteinte > 1 ? "s" : ""}`;
    } else {
      messageTemps = `${moisRestants} mois`;
    }

    if (objectifAtteinteDate <= objectifEnMois) {
      messageElement.innerHTML = `
                <div class="alert alert-success">
                    Votre objectif d'épargne de ${formatMoney(objectifEpargne)} sera atteint en ${messageTemps}, 
                    ce qui est dans le délai souhaité de ${objectifAnnees} an${objectifAnnees > 1 ? "s" : ""}.
                </div>
            `;
    } else {
      messageElement.innerHTML = `
                <div class="alert alert-warning">
                    Votre objectif d'épargne de ${formatMoney(objectifEpargne)} sera atteint en ${messageTemps}, 
                    ce qui dépasse votre délai souhaité de ${objectifAnnees} an${objectifAnnees > 1 ? "s" : ""}.
                    <br>Pour atteindre votre objectif dans le délai souhaité, vous devriez déposer ${formatMoney(depotNecessaire)} par mois.
                </div>
            `;
    }
  } else {
    messageElement.innerHTML = `
            <div class="alert alert-danger">
                Votre objectif d'épargne de ${formatMoney(objectifEpargne)} ne sera pas atteint dans les ${dureeAnnees} années simulées.
                <br>Pour atteindre votre objectif en ${objectifAnnees} an${objectifAnnees > 1 ? "s" : ""}, 
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
    tauxAnnuel,
    objectifEpargne,
    objectifAnnees,
    objectifAtteint,
    objectifAtteinteDate,
    depotNecessaire,
  );
});

// Mise à jour du graphique
function updateChart(resultats, objectif, objectifMois) {
  const ctx = document.getElementById("epargneChart").getContext("2d");

  // Détruire le graphique précédent s'il existe
  if (chart) {
    chart.destroy();
  }

  // Préparer les données pour le graphique
  const labels = resultats.map((r) => r.mois / 12);
  const epargneData = resultats.map((r) => r.epargne);

  // Créer la ligne d'objectif
  const objectifData = labels.map(() => objectif);

  // Créer la ligne verticale pour le délai d'objectif
  const objectifDelaiData = labels.map((annee, index) => {
    return annee <= objectifMois / 12 ? null : 0;
  });

  // Configuration du graphique
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Épargne (Ar)",
          data: epargneData,
          borderColor: "#3498db",
          backgroundColor: "rgba(113, 219, 52, 0.21)",
          borderWidth: 4,
          fill: true,
          tension: 0.1,
        },
        {
          label: "Objectif",
          data: objectifData,
          borderColor: "#28a745",
          borderWidth: 2,
          borderDash: [6, 2],
          fill: false,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              if (context.datasetIndex === 0) {
                const mois = context.label * 12;
                const annees = Math.floor(mois / 12);
                let periode = "";

                if (annees > 0) {
                  periode = `${annees} an${annees > 1 ? "s" : ""}`;
                }

                return `Épargne après ${periode}: ${formatMoney(context.raw)}`;
              } else {
                return `Objectif: ${formatMoney(context.raw)}`;
              }
            },
          },
        },
        legend: {
          position: "bottom",
        },
        annotation: {
          annotations: {
            line1: {
              type: "line",
              xMin: objectifMois / 12,
              xMax: objectifMois / 12,
              borderColor: "rgba(255, 99, 132, 0.7)",
              borderWidth: 2,
              label: {
                content: "Délai souhaité",
                enabled: true,
              },
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Années",
          },
        },
        y: {
          title: {
            display: true,
            text: "Épargne (Ar)",
          },
          beginAtZero: true,
        },
      },
      onClick: function (e, elements) {
        if (elements.length > 0) {
          const index = elements[0].index;
          const data = resultats[index];

          document.getElementById("pointInfo").innerHTML = `
                        <strong>Après ${Math.floor(data.mois / 12)} an${Math.floor(data.mois / 12) > 1 ? "s" : ""}:</strong><br>
                        Épargne: ${formatMoney(data.epargne)}<br>
                        Intérêts cumulés: ${formatMoney(data.interetsCumules)}<br>
                        Dépôts cumulés: ${formatMoney(data.depotsCumules)}<br>
                    `;
        }
      },
    },
  });

  // Afficher l'annotation du délai objectif
  const objectifMoisAnnees = objectifMois / 12;
  const canvasWidth = ctx.canvas.width;
  const xPosition =
    (objectifMoisAnnees / labels[labels.length - 1]) * canvasWidth;
}

// Mise à jour du tableau
function updateTable(resultats) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  resultats.forEach((data) => {
    const row = document.createElement("tr");

    const annees = Math.floor(data.mois / 12);
    const mois = data.mois % 12;
    let periodeText;

    if (data.mois === 0) {
      periodeText = "Départ";
    } else if (mois === 0) {
      periodeText = `${annees} an${annees > 1 ? "s" : ""}`;
    } else {
      periodeText = `${annees} an${annees > 1 ? "s" : ""} et ${mois} mois`;
    }

    row.innerHTML = `
            <td>${periodeText}</td>
            <td>${formatMoney(data.epargne)}</td>
            <td>${formatMoney(data.interetsCumules)}</td>
            <td>${formatMoney(data.depotsCumules)}</td>
        `;

    tableBody.appendChild(row);
  });
}

// Mise à jour de l'analyse
function updateAnalysis(
  resultats,
  epargneInitiale,
  depotMensuel,
  tauxAnnuel,
  objectif,
  objectifAnnees,
  objectifAtteint,
  objectifAtteinteDate,
  depotNecessaire,
) {
  const analyseContenu = document.getElementById("analyseContenu");
  const recommandations = document.getElementById("recommandations");

  // Calculer des statistiques sur la simulation
  const epargneFinale = resultats[resultats.length - 1].epargne;
  const interetsCumules = resultats[resultats.length - 1].interetsCumules;
  const depotsCumules = resultats[resultats.length - 1].depotsCumules;
  const dureeAnnees = resultats[resultats.length - 1].mois / 12;

  // Ratio intérêts/dépôts
  const ratioInteretsDepots =
    interetsCumules / (depotsCumules > 0 ? depotsCumules : 1);

  // Analyse de rentabilité
  analyseContenu.innerHTML = `
        <p>Sur une période de ${dureeAnnees.toFixed(1)} années:</p>
        <ul>
            <li>Épargne finale : ${formatMoney(epargneFinale)}</li>
            <li>Intérêts cumulés : ${formatMoney(interetsCumules)} (${((interetsCumules / epargneFinale) * 100).toFixed(1)}% de l'épargne finale)</li>
            <li>Dépôts cumulés : ${formatMoney(depotsCumules)}</li>
            
        </ul>
        
        <p>Pour chaque Ariary déposé, vous avez généré ${ratioInteretsDepots.toFixed(2)}Ar d'intérêts.</p>
        
        <p>Rendement effectif de votre investissement:</p>
        <div style="background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
            <strong>Taux effectif annuel moyen : ${((Math.pow(epargneFinale / epargneInitiale, 1 / dureeAnnees) - 1) * 100).toFixed(2)}%</strong>
            ${depotMensuel > 0 ? `<br>Ce taux tient compte de vos versements mensuels réguliers de ${formatMoney(depotMensuel)}.` : ""}
        </div>
    `;

  // Recommandations
  let recContent = "";

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

      let tempsGagne = "";
      if (anneesGagnees > 0 && moisGagnes > 0) {
        tempsGagne = `${anneesGagnees} an${anneesGagnees > 1 ? "s" : ""} et ${moisGagnes} mois`;
      } else if (anneesGagnees > 0) {
        tempsGagne = `${anneesGagnees} an${anneesGagnees > 1 ? "s" : ""}`;
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
    if (epargneFinale > 5000000000) {
      recContent += `
                <p>Avec une épargne finale importante (${formatMoney(epargneFinale)}), pensez à explorer des options d'optimisation fiscale :</p>
                <ul>
                    <li>Plans d'épargne e</li>
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
            
            <p>Pour atteindre votre objectif en ${objectifAnnees} an${objectifAnnees > 1 ? "s" : ""}, vous devriez :</p>
            <ul>
                <li>Augmenter votre dépôt mensuel à ${formatMoney(depotNecessaire)} (+ ${formatMoney(depotNecessaire - depotMensuel)})</li>
                <li>Ou chercher un placement avec un taux d'intérêt plus élevé (au moins ${(tauxAnnuel * 100 * 1.5).toFixed(2)}%)</li>
                <li>Ou diminuer les s mensuels si possible</li>
            </ul>
        `;
  } else {
    // Objectif non atteint
    recContent += `
            <div class="alert alert-danger">
                <p>Votre plan d'épargne n'atteint pas votre objectif de ${formatMoney(objectif)} dans la période simulée.</p>
            </div>
            
            <p>Pour atteindre votre objectif en ${objectifAnnees} an${objectifAnnees > 1 ? "s" : ""}, vous pourriez :</p>
            <ul>
                <li>Augmenter significativement votre dépôt mensuel à ${formatMoney(depotNecessaire)} (+ ${formatMoney(depotNecessaire - depotMensuel)})</li>
                <li>Chercher un placement avec un meilleur rendement (minimum recommandé : ${Math.max(tauxAnnuel * 100 * 2, 5).toFixed(2)}%)</li>
                <li>Réévaluer votre objectif d'épargne ou l'horizon temporel</li>
            </ul>
        `;
  }

  // Ajouter des conseils généraux
  recContent += `

    `;

  recommandations.innerHTML = recContent;
}

// Initialiser les graphiques, tableaux et analyses vides au chargement
// Remplacez le dispatchEvent par un appel direct à une fonction
window.addEventListener("load", function () {
  initialiserSimulation();
  afficherHistorique(); // Afficher l'historique existant
});

//fonction pour initialiser la simulation
function initialiserSimulation() {
  const epargneForm = document.getElementById("epargneForm");
  const event = new Event("submit", { cancelable: true });
  epargneForm.dispatchEvent(event);
}
