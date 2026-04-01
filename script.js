/* ============================================
   MISS EGEM 2026 - JavaScript avec Firebase
   ============================================ */

// Configuration Firebase - Vous devrez créer un projet Firebase et remplacer cette config
const firebaseConfig = {
    apiKey: "AIzaSyDemo-REMPLACEZ-PAR-VOTRE-CLE",
    authDomain: "miss-egem-2026.firebaseapp.com",
    databaseURL: "https://miss-egem-2026-default-rtdb.firebaseio.com",
    projectId: "miss-egem-2026",
    storageBucket: "miss-egem-2026.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Configuration du site
const CONFIG = {
    siteName: 'MISS EGEM 2026',
    siteUrl: 'https://mev177.github.io/miss-egem-2026/',
    pricePerVote: 100,
    payments: {
        orange: {
            number: '659688759',
            displayNumber: '659 68 87 59',
            name: 'DJENGUE Yassine'
        },
        mtn: {
            number: '683685581',
            displayNumber: '683 68 55 81',
            name: 'Alvarez Rychelle'
        }
    },
    candidates: {
        1: { name: 'EBI ONGONO', poste: 'MG1' },
        2: { name: 'KOLNIKIE FLEUR', poste: 'PGE 1' },
        3: { name: 'NGA NNANG', poste: 'RPC3' },
        4: { name: 'MOUKAM Merciale', poste: 'PGE1' }
    }
};

// State
let currentCandidate = null;
let currentAmount = 100;
let currentVotes = 1;
let db = null;

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log('Firebase initialisé');
} catch (error) {
    console.log('Firebase non configuré - Mode local activé');
}

// DOM Elements
const voteModal = document.getElementById('voteModal');
const successModal = document.getElementById('successModal');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initShareLinks();
    initMobileMenu();
    loadVotesFromStorage();
    
    // Load votes from Firebase if available
    if (db) {
        loadVotesFromFirebase();
    }
});

// ============================================
// Share Links
// ============================================
function initShareLinks() {
    const shareText = `🗳️ Votez pour votre candidate préférée à MISS EGEM 2026 ! 👑\n\n100 FCFA = 1 vote\n💰 Orange Money: ${CONFIG.payments.orange.displayNumber}\n💰 MTN MoMo: ${CONFIG.payments.mtn.displayNumber}\n\nVotez maintenant :`;
    const shareUrl = CONFIG.siteUrl;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    
    // Set share links
    ['shareWhatsapp', 'footerWhatsapp', 'successWhatsapp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.href = whatsappUrl;
    });
    
    ['shareFacebook', 'footerFacebook', 'successFacebook'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.href = facebookUrl;
    });
    
    const copyBtn = document.getElementById('copyLink');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(shareUrl);
            showToast('Lien copié !');
        });
    }
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
    
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
}

// ============================================
// Vote Modal Steps
// ============================================
function openVoteModal(candidateNumber, candidateName) {
    currentCandidate = {
        number: candidateNumber,
        name: candidateName
    };
    currentAmount = 100;
    currentVotes = 1;
    
    // Update modal
    document.getElementById('modalCandidateName').textContent = candidateName;
    document.getElementById('modalCandidateNumber').textContent = candidateNumber;
    document.getElementById('voteAmount').value = 100;
    document.getElementById('votesPreview').textContent = '1';
    
    // Show step 1
    showStep(1);
    
    voteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVoteModal() {
    voteModal.classList.remove('active');
    document.body.style.overflow = '';
}

function showStep(stepNumber) {
    document.querySelectorAll('.modal-step').forEach(step => {
        step.style.display = 'none';
    });
    document.getElementById(`step${stepNumber}`).style.display = 'block';
}

function goToStep1() {
    showStep(1);
}

function goToStep2() {
    // Update step 2 info
    document.getElementById('step2Amount').textContent = currentAmount.toLocaleString();
    document.getElementById('step2Votes').textContent = currentVotes;
    document.getElementById('amountToSend').textContent = currentAmount.toLocaleString();
    document.getElementById('paymentMotif').textContent = `MISS ${currentCandidate.number}`;
    
    showStep(2);
}

function goToStep3() {
    // Update summary
    document.getElementById('summaryCandidate').textContent = `N°${currentCandidate.number} - ${currentCandidate.name}`;
    document.getElementById('summaryAmount').textContent = `${currentAmount.toLocaleString()} FCFA`;
    document.getElementById('summaryVotes').textContent = `${currentVotes} vote(s)`;
    
    // Clear phone input
    document.getElementById('voterPhone').value = '';
    
    showStep(3);
}

// ============================================
// Amount Controls
// ============================================
function adjustAmount(delta) {
    const input = document.getElementById('voteAmount');
    let newValue = parseInt(input.value) + delta;
    if (newValue < 100) newValue = 100;
    input.value = newValue;
    currentAmount = newValue;
    updateVotes();
}

function setAmount(amount) {
    document.getElementById('voteAmount').value = amount;
    currentAmount = amount;
    updateVotes();
}

function updateVotes() {
    const amount = parseInt(document.getElementById('voteAmount').value) || 100;
    currentAmount = Math.max(100, amount);
    document.getElementById('voteAmount').value = currentAmount;
    currentVotes = Math.floor(currentAmount / CONFIG.pricePerVote);
    document.getElementById('votesPreview').textContent = currentVotes;
}

// ============================================
// Submit Vote
// ============================================
function submitVote() {
    const phone = document.getElementById('voterPhone').value.trim();
    
    // Validate phone
    if (!phone || phone.length < 9) {
        showToast('Veuillez entrer un numéro valide');
        return;
    }
    
    // Create vote record
    const voteData = {
        candidateNumber: currentCandidate.number,
        candidateName: currentCandidate.name,
        amount: currentAmount,
        votes: currentVotes,
        phone: phone,
        timestamp: new Date().toISOString(),
        status: 'pending' // pending, validated, rejected
    };
    
    // Save to Firebase if available
    if (db) {
        saveVoteToFirebase(voteData);
    } else {
        // Save locally
        saveVoteLocally(voteData);
    }
    
    // Close vote modal and show success
    closeVoteModal();
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function saveVoteToFirebase(voteData) {
    const votesRef = db.ref('pendingVotes');
    votesRef.push(voteData)
        .then(() => {
            console.log('Vote enregistré dans Firebase');
        })
        .catch((error) => {
            console.error('Erreur Firebase:', error);
            saveVoteLocally(voteData);
        });
}

function saveVoteLocally(voteData) {
    let pendingVotes = JSON.parse(localStorage.getItem('pendingVotes') || '[]');
    pendingVotes.push(voteData);
    localStorage.setItem('pendingVotes', JSON.stringify(pendingVotes));
    console.log('Vote enregistré localement');
}

function closeSuccessModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// Load Votes
// ============================================
function loadVotesFromStorage() {
    // Load validated votes from localStorage
    for (let i = 1; i <= 4; i++) {
        const votes = localStorage.getItem(`validated_votes_${i}`) || '0';
        const el = document.getElementById(`votes-${i}`);
        if (el) el.textContent = votes;
    }
}

function loadVotesFromFirebase() {
    const votesRef = db.ref('validatedVotes');
    votesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            for (let i = 1; i <= 4; i++) {
                const votes = data[`candidate_${i}`] || 0;
                const el = document.getElementById(`votes-${i}`);
                if (el) el.textContent = votes;
                // Also save locally for offline access
                localStorage.setItem(`validated_votes_${i}`, votes);
            }
        }
    });
}

// ============================================
// Utility Functions
// ============================================
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showToast(message) {
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Close modals on overlay click
if (voteModal) {
    voteModal.addEventListener('click', (e) => {
        if (e.target === voteModal) closeVoteModal();
    });
}

if (successModal) {
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeSuccessModal();
    });
}

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVoteModal();
        closeSuccessModal();
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});
