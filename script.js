// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
    apiKey: "AIzaSyDPQmzrglLhI6Q7TT_5_9TGxUGkf0Wubqk",
    authDomain: "miss-egem-2026-8b880.firebaseapp.com",
    databaseURL: "https://miss-egem-2026-8b880-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "miss-egem-2026-8b880",
    storageBucket: "miss-egem-2026-8b880.firebasestorage.app",
    messagingSenderId: "27908518692",
    appId: "1:27908518692:web:620e674927e706fad339b1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ===== GLOBAL STATE =====
let currentCandidate = {
    number: 0,
    name: ''
};
let currentAmount = 100;
let currentVotes = 1;

// ===== CHARTS =====
let voteCharts = {};

// ===== SITE URL =====
const SITE_URL = 'https://mev177.github.io/miss-egem-2026/';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initShareButtons();
    initCharts();
    loadVotesFromFirebase();
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
    const message = "🗳️ Votez pour vos favoris à MISS & MISTER EGEM 2026 ! 100 FCFA = 1 vote " + SITE_URL;
    
    const whatsappBtn = document.getElementById('shareWhatsapp');
    if (whatsappBtn) {
        whatsappBtn.href = 'https://wa.me/?text=' + encodeURIComponent(message);
    }
    
    const successWhatsapp = document.getElementById('successWhatsapp');
    if (successWhatsapp) {
        successWhatsapp.href = 'https://wa.me/?text=' + encodeURIComponent(message);
    }
    
    const facebookBtn = document.getElementById('shareFacebook');
    if (facebookBtn) {
        facebookBtn.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SITE_URL);
    }
    
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
    
    document.getElementById('modalCandidateName').textContent = name;
    document.getElementById('modalCandidateNumber').textContent = number;
    document.getElementById('voteAmount').value = 100;
    document.getElementById('votesPreview').textContent = '1';
    document.getElementById('motifText').textContent = 'MISS ' + number;
    
    showStep(1);
    
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
    
    document.getElementById('step2Amount').textContent = amount;
    document.getElementById('step2Votes').textContent = currentVotes;
    document.getElementById('amountDisplay').textContent = amount;
    document.getElementById('ussdAmount').textContent = amount;
    
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    document.getElementById('paymentDetails').style.display = 'none';
    
    showStep(2);
}

// ===== PAYMENT SELECTION =====
let selectedPaymentMethod = null;

function selectPayment(method) {
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    document.querySelector('.payment-method.' + method).classList.add('selected');
    
    selectedPaymentMethod = method;
    
    const details = document.getElementById('paymentDetails');
    details.style.display = 'block';
    
    if (method === 'orange') {
        document.getElementById('selectedOperator').textContent = 'Orange Money';
        document.getElementById('selectedNumber').textContent = '983650';
        document.getElementById('selectedName').textContent = 'ASECK LYDIA';
        document.getElementById('selectedUssd').innerHTML = 'Tapez <strong>#150*47*983650*' + currentAmount + '#</strong>';
    } else {
        document.getElementById('selectedOperator').textContent = 'MTN Mobile Money';
        document.getElementById('selectedNumber').textContent = '683 68 55 81';
        document.getElementById('selectedName').textContent = 'Alvarez Rychelle';
        document.getElementById('selectedUssd').innerHTML = 'Tapez <strong>*126#</strong> → Transfert → <span id="ussdAmount">' + currentAmount + '</span> FCFA';
    }
}

function copySelectedNumber() {
    const number = selectedPaymentMethod === 'orange' ? '983650' : '683685581';
    copyToClipboard(number);
    showToast('Numéro copié !');
}

function goToStep3() {
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
    
    document.querySelectorAll('.quick-amounts button').forEach(btn => {
        btn.classList.remove('active');
        const btnAmount = parseInt(btn.textContent.replace('K', '000').replace(/[^0-9]/g, ''));
        if (btnAmount === amount) {
            btn.classList.add('active');
        }
    });
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

// ===== SUBMIT VOTE TO FIREBASE =====
function submitVote() {
    const phone = document.getElementById('voterPhone').value.trim();
    
    if (!phone || phone.length < 9) {
        alert('Veuillez entrer votre numéro de téléphone (9 chiffres)');
        return;
    }
    
    // Create pending vote
    const pendingVote = {
        candidateNumber: currentCandidate.number,
        candidateName: currentCandidate.name,
        amount: currentAmount,
        votes: currentVotes,
        phone: phone,
        paymentMethod: selectedPaymentMethod,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Save to Firebase
    database.ref('pendingVotes').push(pendingVote)
        .then(function() {
            closeVoteModal();
            document.getElementById('voterPhone').value = '';
            document.getElementById('successModal').classList.add('active');
            showToast('Vote enregistré ! En attente de validation.');
        })
        .catch(function(error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
        });
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// ===== FIREBASE: LOAD VOTES IN REAL-TIME =====
function loadVotesFromFirebase() {
    // Listen for confirmed votes in real-time
    database.ref('confirmedVotes').on('value', function(snapshot) {
        const votes = snapshot.val() || {};
        console.log('Votes chargés:', votes);
        
        // Update all candidate vote counts
        for (let i = 1; i <= 30; i++) {
            const voteCount = votes['candidate_' + i] || 0;
            const element = document.getElementById('votes-' + i);
            if (element) {
                element.textContent = voteCount;
            }
        }
    }, function(error) {
        console.error('Erreur Firebase:', error);
    });
}

// Retry connection if offline
function checkFirebaseConnection() {
    database.ref('.info/connected').on('value', function(snapshot) {
        if (snapshot.val() === true) {
            console.log('Connecté à Firebase');
        } else {
            console.log('Déconnecté de Firebase');
        }
    });
}

// ===== CHARTS INITIALIZATION =====
function initCharts() {
    const chartColors = {
        miss: {
            line: '#c41e3a',
            fill: 'rgba(196, 30, 58, 0.2)'
        },
        mister: {
            line: '#d4a017',
            fill: 'rgba(212, 160, 23, 0.2)'
        }
    };

    for (let i = 1; i <= 20; i++) {
        const canvas = document.getElementById('chart-' + i);
        if (canvas) {
            const isMister = i >= 10;
            const colors = isMister ? chartColors.mister : chartColors.miss;
            
            const ctx = canvas.getContext('2d');
            voteCharts[i] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Votes',
                        data: [],
                        borderColor: colors.line,
                        backgroundColor: colors.fill,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: colors.line
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#1a1a1a',
                            titleColor: '#d4a017',
                            bodyColor: '#fff',
                            borderColor: '#d4a017',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            display: false,
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return day + '/' + month + ' ' + hours + ':' + mins;
}
