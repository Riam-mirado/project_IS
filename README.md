
# SIMULATION DE COMPTE EPARGNE

## équation différentielle pour l'épargne:

### E' = dE/dt = r*E + d

## avec:

###    E: foncion coorespandant à l'épargne
###    r: taux annuel
###    d: depot constant

## input:

###    Épargne initiale (Ar)
###    Dépôt mensuel (Ar)
###    Taux d'intérêt annuel (%)
###    Durée de simulation (années)
###    Objectif d'épargne (Ar)
###    Objectif à atteindre en (années)
###    Méthode d'intégration (rung-kutta d'ordre 4 et Euler)

## output

###    Graphique montrant l'evolution de l'epargne dans le temps impatie indiqant l'intérêt cumuler et le dépôts cumler sur chaque année et montrant aussi graphiquement si l'objectif peut être atteint au pas
###    Tableau montrant l'Epargne, l'intérêt cumuler et le dépôts cumler sur chaque année
###    Analyse detailler de la simulation

## type d'alerte
 
###    alerte vert: 
####          Félicitations ! Votre plan d'épargne atteint votre objectif de <Objectif d'épargne> Ar dans le délai souhaité
####          Votre objectif d'épargne de <Objectif d'épargne> Ar sera atteint en <X> ans, ce qui est dans le délai souhaité de <Objectif à atteindre en> ans.

###    alerte jaune: 
####          Votre objectif d'épargne de <Objectif d'épargne> Ar sera atteint en <X> ans, ce qui dépasse votre délai souhaité de <Objectif à atteindre en> ans.Pour atteindre votre objectif dans le délai souhaité, vous devriez déposer <depot mensuel suggérer> Ar par mois.
####          Votre plan d'épargne atteint votre objectif de <Objectif d'épargne>, mais pas dans le délai souhaité.

###    alerte rouge: 
####          Votre objectif d'épargne de <Objectif d'épargne> Ar ne sera pas atteint dans les <Durée de simulation>  années simulées. Pour atteindre votre objectif en <Objectif à atteindre en> ans, vous devriez déposer <depot mensuel suggérer> par mois
####          Votre plan d'épargne n'atteint pas votre objectif de <Objectif d'épargne> dans la période simulée.

## Analyse de la simulation

###    Epargne final, intérêts cumulés, dépôts cumulés, intérêts sur chaque Ariary déposé, taux effectif moyen.

## Recommandation

###     vert : 
####          Objectif atteint en X année d'avance. Option possible:
######          Réduire votre dépôt mensuel à environ <depot mensuel suggérer> pour atteindre votre objectif dans le délai initial
######          Continuer avec votre plan actuel pour obtenir une épargne finale supérieure
######          Augmenter votre objectif d'épargne pour viser plus haut

###     jaune:
####          Pour atteindre votre objectif en  <Objectif à atteindre en (années)> ans, vous devriez :
######          Augmenter votre dépôt mensuel à <depot mensuel suggérer> (+ <différence avec depot mensuel en cours>)
######          Ou chercher un placement avec un taux d'intérêt plus élevé (au moins <taux d'intérêt recommandé>)

###     rouge: 
####          Pour atteindre votre objectif en <Objectif à atteindre en (années)> ans, vous pourriez :
######          Augmenter significativement votre dépôt mensuel à <depot mensuel suggérer> Ar (+ <différence avec depot mensuel en cours>)
######          Chercher un placement avec un meilleur rendement (minimum recommandé : <taux d'intérêt recommandé>)
######          Réévaluer votre objectif d'épargne ou l'horizon temporel

###     Conseil généraux:
######          Diversifiez vos placements pour réduire les risques
######          Constituez d'abord un fonds d'urgence équivalent à 3-6 mois de dépenses
######          Réévaluez régulièrement votre stratégie d'épargne en fonction de votre situation personnelle
######          Prenez en compte l'inflation dans vos projections à long terme

