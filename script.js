// ===== GLOBAL STATE =====
let currentCandidate = {
    number: 0,
    name: ''
};
let currentAmount = 100;
let currentVotes = 1;

// ===== SITE URL =====
const SITE_URL = 'https://mev177.github.io/miss-egem-2026/';

// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
    votes: 'missEgem2026_votes',
    pendingVotes: 'missEgem2026_pending'
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initShareButtons();
    loadVotes();
});

// ===== MOBILE MENU =====
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu on link click
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                menuBtn.querySelector('i').classList.remove('fa-times');
                menuBtn.querySelector('i').classList.add('fa-bars');
            });
        });
    }
}

// ===== SHARE BUTTONS =====
function initShareButtons() {
    const message = "🗳️ Votez pour votre candidate préférée à MISS EGEM 2026 ! 100 FCFA = 1 vote " + SITE_URL;
    
    // WhatsApp Share
    const whatsappBtn = document.getElementById('shareWhatsapp');
    if (whatsappBtn) {
        whatsappBtn.href = 'https://wa.me/?text=' + encodeURIComponent(message);
    }
    
    // Success modal WhatsApp
    const successWhatsapp = document.getElementById('successWhatsapp');
    if (successWhatsapp) {
        successWhatsapp.href = 'https://wa.me/?text=' + encodeURIComponent(message);
    }
    
    // Facebook Share
    const facebookBtn = document.getElementById('shareFacebook');
    if (facebookBtn) {
        facebookBtn.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SITE_URL);
    }
    
    // Copy Link
    const copyBtn = document.getElementById('copyLink');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            copyToClipboard(SITE_URL);
            showToast('Lien copié !');
        });
    }
}

// ===== VOTE MODAL =====
function openVoteModal(number, name) {
    currentCandidate.number = number;
    currentCandidate.name = name;
    currentAmount = 100;
    currentVotes = 1;
    
    // Update modal content
    document.getElementById('modalCandidateName').textContent = name;
    document.getElementById('modalCandidateNumber').textContent = number;
    document.getElementById('voteAmount').value = 100;
    document.getElementById('votesPreview').textContent = '1';
    document.getElementById('motifText').textContent = 'MISS ' + number;
    
    // Show step 1
    showStep(1);
    
    // Show modal
    document.getElementById('voteModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVoteModal() {
    document.getElementById('voteModal').classList.remove('active');
    document.body.style.overflow = '';
}

function showStep(step) {
    document.getElementById('step1').style.display = step === 1 ? 'block' : 'none';
    document.getElementById('step2').style.display = step === 2 ? 'block' : 'none';
    document.getElementById('step3').style.display = step === 3 ? 'block' : 'none';
}

function goToStep1() {
    showStep(1);
}

function goToStep2() {
    const amount = parseInt(document.getElementById('voteAmount').value) || 100;
    
    if (amount < 100) {
        alert('Le montant minimum est de 100 FCFA');
        return;
    }
    
    currentAmount = amount;
    currentVotes = Math.floor(amount / 100);
    
    // Update step 2 content
    document.getElementById('step2Amount').textContent = amount;
    document.getElementById('step2Votes').textContent = currentVotes;
    document.getElementById('amountDisplay').textContent = amount;
    
    showStep(2);
}

function goToStep3() {
    // Update summary
    document.getElementById('summaryCandidate').textContent = currentCandidate.name + ' (N°' + currentCandidate.number + ')';
    document.getElementById('summaryAmount').textContent = currentAmount + ' FCFA';
    document.getElementById('summaryVotes').textContent = currentVotes + ' vote(s)';
    
    showStep(3);
}

// ===== AMOUNT CONTROLS =====
function adjustAmount(delta) {
    const input = document.getElementById('voteAmount');
    let value = parseInt(input.value) || 100;
    value += delta;
    if (value < 100) value = 100;
    input.value = value;
    updateVotes();
}

function setAmount(amount) {
    document.getElementById('voteAmount').value = amount;
    updateVotes();
}

function updateVotes() {
    const amount = parseInt(document.getElementById('voteAmount').value) || 0;
    const votes = Math.floor(amount / 100);
    document.getElementById('votesPreview').textContent = votes > 0 ? votes : 0;
}

// ===== COPY FUNCTIONS =====
function copyNumber(number, type) {
    copyToClipboard(number);
    showToast('Numéro copié !');
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (e) {
            console.error('Copy failed', e);
        }
        document.body.removeChild(textarea);
    }
}

// ===== TOAST =====
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2500);
}

// ===== SUBMIT VOTE =====
function submitVote() {
    const phone = document.getElementById('voterPhone').value.trim();
    
    if (!phone || phone.length < 9) {
        alert('Veuillez entrer votre numéro de téléphone (9 chiffres)');
        return;
    }
    
    // Create pending vote
    const pendingVote = {
        id: Date.now(),
        candidateNumber: currentCandidate.number,
        candidateName: currentCandidate.name,
        amount: currentAmount,
        votes: currentVotes,
        phone: phone,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Save to pending votes
    savePendingVote(pendingVote);
    
    // Close vote modal
    closeVoteModal();
    
    // Clear phone input
    document.getElementById('voterPhone').value = '';
    
    // Show success modal
    document.getElementById('successModal').classList.add('active');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// ===== LOCAL STORAGE FUNCTIONS =====
function loadVotes() {
    try {
        const votesData = localStorage.getItem(STORAGE_KEYS.votes);
        if (votesData) {
            const votes = JSON.parse(votesData);
            for (let i = 1; i <= 4; i++) {
                const voteCount = votes['candidate_' + i] || 0;
                const element = document.getElementById('votes-' + i);
                if (element) {
                    element.textContent = voteCount;
                }
            }
        }
    } catch (e) {
        console.error('Error loading votes:', e);
    }
}

function savePendingVote(vote) {
    try {
        let pending = [];
        const data = localStorage.getItem(STORAGE_KEYS.pendingVotes);
        if (data) {
            pending = JSON.parse(data);
        }
        pending.push(vote);
        localStorage.setItem(STORAGE_KEYS.pendingVotes, JSON.stringify(pending));
    } catch (e) {
        console.error('Error saving pending vote:', e);
    }
}

// ===== HELPER: Get votes from storage =====
function getVotes() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.votes);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error getting votes:', e);
    }
    return {
        candidate_1: 0,
        candidate_2: 0,
        candidate_3: 0,
        candidate_4: 0
    };
}

// ===== HELPER: Save votes to storage =====
function saveVotes(votes) {
    try {
        localStorage.setItem(STORAGE_KEYS.votes, JSON.stringify(votes));
    } catch (e) {
        console.error('Error saving votes:', e);
    }
}

// ===== Detect Mobile OS for payment links =====
function getMobileOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    
    return 'unknown';
}

// Info: Les liens tel: pour les USSD fonctionnent automatiquement sur Android et iOS
// Orange Money: tel:*150*1*1*659688759# 
// MTN MoMo: tel:*126*1*1*683685581#
