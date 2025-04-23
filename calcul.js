//équation différentielle pour l'épargne
function dEpargne(epargne, tauxMensuel, depotMensuel) {
    // dE/dt = r*E + d  
    return tauxMensuel * epargne + depotMensuel ;
    }
    
function euler(epargneInitiale, tauxMensuel, depotMensuel, dureeEnMois, pasEnMois = 1) {
    const resultats = [];
    let epargne = epargneInitiale;
    let interetsCumules = 0;
    let depotsCumules = 0;
    
    resultats.push({
        mois: 0,
        epargne: epargne,
        interetsCumules: interetsCumules,
        depotsCumules: depotsCumules,
    });
    
    for (let mois = pasEnMois; mois <= dureeEnMois; mois += pasEnMois) {
        const interetMensuel = tauxMensuel * epargne;
        interetsCumules += interetMensuel;
        depotsCumules += depotMensuel;
        
        epargne += dEpargne(epargne, tauxMensuel, depotMensuel) * pasEnMois;
        epargne = Math.max(0, epargne); // Éviter les valeurs négatives
        
        if (mois % 12 === 0 || mois === dureeEnMois) {
            resultats.push({
                mois: mois,
                epargne: epargne,
                interetsCumules: interetsCumules,
                depotsCumules: depotsCumules,
            });
        }
    }
    
    return resultats;
}
    
function rungeKutta4(epargneInitiale, tauxMensuel, depotMensuel, dureeEnMois, pasEnMois = 1) {
    const resultats = [];
    let epargne = epargneInitiale;
    let interetsCumules = 0;
    let depotsCumules = 0;
    
    resultats.push({
        mois: 0,
        epargne: epargne,
        interetsCumules: interetsCumules,
        depotsCumules: depotsCumules,
    });
    
    for (let mois = pasEnMois; mois <= dureeEnMois; mois += pasEnMois) {
        // Calcul des coefficients k1, k2, k3, k4 pour RK4
        const k1 = dEpargne(epargne, tauxMensuel, depotMensuel);
        const k2 = dEpargne(epargne + 0.5 * pasEnMois * k1, tauxMensuel, depotMensuel);
        const k3 = dEpargne(epargne + 0.5 * pasEnMois * k2, tauxMensuel, depotMensuel);
        const k4 = dEpargne(epargne + pasEnMois * k3, tauxMensuel, depotMensuel);
        
        // Mise à jour avec la moyenne pondérée des coefficients
        const delta = (k1 + 2*k2 + 2*k3 + k4) / 6 * pasEnMois;
        
        // Calcul des intérêts pour ce pas de temps
        const interetMensuel = tauxMensuel * epargne;
        interetsCumules += interetMensuel;
        depotsCumules += depotMensuel;
        
        epargne += delta;
        epargne = Math.max(0, epargne); // Éviter les valeurs négatives
        
        if (mois % 12 === 0 || mois === dureeEnMois) {
            resultats.push({
                mois: mois,
                epargne: epargne,
                interetsCumules: interetsCumules,
                depotsCumules: depotsCumules,
            });
        }
    }
    
    return resultats;
}
    
function calculerDepotNecessaire(epargneInitiale, tauxMensuel,  objectif, dureeEnMois, methodeIntegration = 'rk4') {
    // recherche dichotomique 
    let depotMin = 0;
    let depotMax = Math.max(5000, objectif / dureeEnMois); // Dépôt maximum raisonnable
    let depot = (depotMin + depotMax) / 2;
    const precision = 1; // Précision à 1Ar près
    
    while (depotMax - depotMin > precision) {
        let resultats;
        if (methodeIntegration === 'rk4') {
            resultats = rungeKutta4(epargneInitiale, tauxMensuel, depot,  dureeEnMois);
        } else {
            resultats = euler(epargneInitiale, tauxMensuel, depot,  dureeEnMois);
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