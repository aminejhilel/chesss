# 🚀 JavaScript LocalStorage App

Une application web moderne développée uniquement avec **HTML, CSS et JavaScript**, avec **LocalStorage** pour sauvegarder les données directement dans le navigateur.

## 📌 Description

Ce projet est une application front-end permettant de gérer des données sans utiliser de backend ni de base de données.

Les informations sont enregistrées dans le **LocalStorage** du navigateur, ce qui permet de conserver les données même après avoir fermé ou actualisé la page.

## 🛠️ Technologies utilisées

* HTML5
* CSS3
* JavaScript
* LocalStorage
* Responsive Design

## ✨ Fonctionnalités

* ➕ Ajouter des éléments
* ✏️ Modifier des éléments
* 🗑️ Supprimer des éléments
* 🔍 Rechercher des éléments
* 💾 Sauvegarder les données avec LocalStorage
* 🔄 Récupérer automatiquement les données après actualisation
* 📱 Interface responsive
* ⚡ Fonctionnement 100% côté client

## 💾 LocalStorage

Le projet utilise `localStorage` pour stocker les données :

```javascript
localStorage.setItem("items", JSON.stringify(items));

const items = JSON.parse(localStorage.getItem("items")) || [];
```

Les données restent disponibles après :

* Actualisation de la page
* Fermeture du navigateur
* Réouverture de l'application

## 📂 Structure du projet

```text
project/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 Installation

Aucune installation particulière n'est nécessaire.

### 1. Cloner le projet

```bash
git clone https://github.com/USERNAME/PROJECT-NAME.git
```

### 2. Entrer dans le dossier

```bash
cd PROJECT-NAME
```

### 3. Lancer le projet

Ouvrir simplement :

```text
index.html
```

dans votre navigateur.

Vous pouvez également utiliser **Live Server** avec VS Code.

## 🎯 Objectif du projet

L'objectif de ce projet est de pratiquer :

* La manipulation du DOM
* Les événements JavaScript
* Les fonctions JavaScript
* Les tableaux et objets
* `JSON.stringify()`
* `JSON.parse()`
* `localStorage`
* La création d'une interface responsive

## 📸 Screenshots

Ajoutez ici les captures d'écran de votre application.

```text
screenshots/
├── home.png
├── add.png
└── dashboard.png
```

## 🔮 Améliorations possibles

Dans les prochaines versions, il serait possible d'ajouter :

* 🌙 Dark Mode
* 🔐 Authentification
* ☁️ Synchronisation avec une API
* 🗄️ Base de données
* 📊 Dashboard avec statistiques
* 🔔 Notifications
* 🎨 Animations avancées

* <img width="1401" height="902" alt="image" src="https://github.com/user-attachments/assets/11ba2c2c-5823-4bb1-bcdb-79f3db7026a0" />


## 👨‍💻 Auteur

**Amine Jhilel**

Développeur Full Stack & UI/UX Designer

### Technologies

HTML • CSS • JavaScript • React • PHP • Laravel • MySQL

---

⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile sur GitHub.
