/* ============================================
   MISS EGEM 2026 - JavaScript
   ============================================ */

// Configuration
const CONFIG = {
    siteName: 'MISS EGEM 2026',
    siteUrl: window.location.href,
    pricePerVote: 100,
    payments: {
        orange: {
            number: '659688759',
            displayNumber: '659 68 87 59',
            name: 'DJENGUE Yassine',
            ussd: '*150#'
        },
        mtn: {
            number: '683685581',
            displayNumber: '683 68 55 81',
            name: 'Alvarez Rychelle',
            ussd: '*126#'
        }
    }
};

// State
let currentCandidate = null;
let currentAmount = 100;
let selectedPayment = null;

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
    loadVotes();
});

// ============================================
// Share Links
// ============================================
function initShareLinks() {
    const shareText = `🗳️ Votez pour votre candidate préférée à l'élection MISS EGEM 2026 ! 👑\n\n100 FCFA = 1 vote\n💰 Orange Money: ${CONFIG.payments.orange.displayNumber}\n💰 MTN MoMo: ${CONFIG.payments.mtn.displayNumber}\n\nVotez maintenant :`;
    const shareUrl = CONFIG.siteUrl;
    
    // WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    document.getElementById('shareWhatsapp').href = whatsappUrl;
    document.getElementById('footerWhatsapp').href = whatsappUrl;
    document.getElementById('successWhatsapp').href = whatsappUrl;
    
    // Facebook
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    document.getElementById('shareFacebook').href = facebookUrl;
    document.getElementById('footerFacebook').href = facebookUrl;
    document.getElementById('successFacebook').href = facebookUrl;
    
    // Copy Link
    document.getElementById('copyLink').addEventListener('click', () => {
        copyToClipboard(shareUrl);
        showToast('Lien copié !');
    });
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// ============================================
// Vote Modal
// ============================================
function openVoteModal(candidateNumber, candidateName) {
    currentCandidate = {
        number: candidateNumber,
        name: candidateName
    };
    currentAmount = 100;
    selectedPayment = null;
    
    document.getElementById('modalCandidateName').textContent = candidateName;
    document.getElementById('modalCandidateNumber').textContent = candidateNumber;
    document.getElementById('voteAmount').value = 100;
    document.getElementById('votesPreview').textContent = '1';
    document.getElementById('paymentInstructions').style.display = 'none';
    
    // Reset payment selection
    document.querySelectorAll('.payment-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    voteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVoteModal() {
    voteModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Amount controls
function adjustAmount(delta) {
    const input = document.getElementById('voteAmount');
    let newValue = parseInt(input.value) + delta;
    if (newValue < 100) newValue = 100;
    input.value = newValue;
    currentAmount = newValue;
    updateVotes();
    updatePaymentInstructions();
}

function setAmount(amount) {
    document.getElementById('voteAmount').value = amount;
    currentAmount = amount;
    updateVotes();
    updatePaymentInstructions();
}

function updateVotes() {
    const amount = parseInt(document.getElementById('voteAmount').value) || 100;
    currentAmount = Math.max(100, amount);
    document.getElementById('voteAmount').value = currentAmount;
    const votes = Math.floor(currentAmount / CONFIG.pricePerVote);
    document.getElementById('votesPreview').textContent = votes;
    updatePaymentInstructions();
}

// Payment selection
function selectPayment(type) {
    selectedPayment = type;
    
    // Update UI
    document.querySelectorAll('.payment-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`.payment-option.${type}`).classList.add('selected');
    
    // Show instructions
    showPaymentInstructions(type);
}

function showPaymentInstructions(type) {
    const payment = CONFIG.payments[type];
    const instructions = document.getElementById('paymentInstructions');
    
    document.getElementById('ussdCode').textContent = payment.ussd;
    document.getElementById('paymentNum').textContent = payment.displayNumber;
    document.getElementById('paymentAmount').textContent = currentAmount.toLocaleString();
    document.getElementById('candidateNum').textContent = currentCandidate.number;
    
    instructions.style.display = 'block';
    instructions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updatePaymentInstructions() {
    if (selectedPayment) {
        document.getElementById('paymentAmount').textContent = currentAmount.toLocaleString();
    }
}

function copyNumber() {
    if (selectedPayment) {
        copyToClipboard(CONFIG.payments[selectedPayment].number);
        showToast('Numéro copié !');
    }
}

function confirmVote() {
    closeVoteModal();
    
    // Show success modal
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update votes display (simulation - in real app, this would be server-side)
    simulateVoteUpdate();
}

function closeSuccessModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// Votes Management (Simulation)
// ============================================
function loadVotes() {
    // Load votes from localStorage (for demo purposes)
    // In a real app, this would fetch from a server
    for (let i = 1; i <= 4; i++) {
        const votes = localStorage.getItem(`votes_candidate_${i}`) || 0;
        document.getElementById(`votes-${i}`).textContent = votes;
    }
}

function simulateVoteUpdate() {
    if (!currentCandidate) return;
    
    const votes = Math.floor(currentAmount / CONFIG.pricePerVote);
    const candidateId = currentCandidate.number;
    const currentVotes = parseInt(localStorage.getItem(`votes_candidate_${candidateId}`)) || 0;
    const newVotes = currentVotes + votes;
    
    localStorage.setItem(`votes_candidate_${candidateId}`, newVotes);
    document.getElementById(`votes-${candidateId}`).textContent = newVotes;
}

// ============================================
// Utility Functions
// ============================================
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback
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
voteModal.addEventListener('click', (e) => {
    if (e.target === voteModal) {
        closeVoteModal();
    }
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeSuccessModal();
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVoteModal();
        closeSuccessModal();
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});
