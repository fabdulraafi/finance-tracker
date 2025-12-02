document.addEventListener('DOMContentLoaded', function() {
    
    const FINNHUB_API_KEY = 'd4kaifhr01qvpdoj0mh0d4kaifhr01qvpdoj0mhg'; 

    // DATA INITIALIZATION
    const defaultData = [
        { id: 1, description: 'Monthly Salary', amount: 4500.00, type: 'credit', category: 'Income', date: '2025-10-01' },
        { id: 2, description: 'Grocery Shopping', amount: 155.75, type: 'debit', category: 'Food', date: '2025-10-02' },
        { id: 3, description: 'Spotify', amount: 10.99, type: 'debit', category: 'Entertainment', date: '2025-10-03' },
        { id: 4, description: 'Gasoline', amount: 45.50, type: 'debit', category: 'Transport', date: '2025-10-04' },
        { id: 5, description: 'Freelance', amount: 750.00, type: 'credit', category: 'Income', date: '2025-10-06' },
        { id: 6, description: 'Rent', amount: 1200.00, type: 'debit', category: 'Housing', date: '2025-10-01' },
        { id: 7, description: 'Stock Div', amount: 55.40, type: 'credit', category: 'Investment', date: '2025-10-05' },
    ];

    // localstorage
    const savedData = localStorage.getItem('financeTrackerData');
    let transactions = savedData ? JSON.parse(savedData) : defaultData;

    function saveData() {
        localStorage.setItem('financeTrackerData', JSON.stringify(transactions));
    }

    const portfolio = [
        { id: 1, name: 'Apple Inc.', ticker: 'AAPL', shares: 15, price: 0, change: 0 },
        { id: 2, name: 'Google', ticker: 'GOOGL', shares: 5, price: 0, change: 0 },
        { id: 3, name: 'Tesla', ticker: 'TSLA', shares: 8, price: 0, change: 0 },
        { id: 4, name: 'Vanguard', ticker: 'VOO', shares: 20, price: 0, change: 0 },
    ];

    // DOM ELEMENTS
    const totalCreditsEl = document.getElementById('total-credits');
    const totalDebitsEl = document.getElementById('total-debits');
    const netBalanceEl = document.getElementById('net-balance');
    const transactionListEl = document.getElementById('transaction-list');
    const portfolioBodyEl = document.getElementById('portfolio-body');
    const addTransactionForm = document.getElementById('add-transaction-form');
    const resetBtn = document.getElementById('reset-btn'); 
    
    // Modal Elements
    const modalOverlay = document.getElementById('modal-overlay');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let myChart = null; 
    let liveChart = null;

    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
    const parseLocalDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // API
    async function updatePortfolioPrices() {
        console.log("Fetching real-time prices...");
        for (let asset of portfolio) {
            try {
                if (FINNHUB_API_KEY === 'd4kaifhr01qvpdoj0mh0d4kaifhr01qvpdoj0mhg') {
                    asset.price = Math.random() * 200 + 100;
                    asset.change = (Math.random() - 0.5) * 5;
                    continue;
                }
                const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${asset.ticker}&token=${d4kaifhr01qvpdoj0mh0d4kaifhr01qvpdoj0mhg}`);
                const data = await response.json();
                if (data.c) {
                    asset.price = data.c;
                    asset.change = data.dp;
                }
            } catch (error) { console.error("Error fetching", asset.ticker); }
        }
        renderPortfolio();
    }

    // RENDER FUNCTIONS
    function renderSummary() {
        const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalCredits - totalDebits;

        if (totalCreditsEl) totalCreditsEl.textContent = formatCurrency(totalCredits);
        if (totalDebitsEl) totalDebitsEl.textContent = formatCurrency(totalDebits);
        if (netBalanceEl) netBalanceEl.textContent = formatCurrency(netBalance);
    }

    function renderTransactions() {
        transactionListEl.innerHTML = '';
        const sortedTransactions = [...transactions].sort((a,b) => parseLocalDate(b.date) - parseLocalDate(a.date));

        sortedTransactions.forEach(t => {
            const isCredit = t.type === 'credit';
            const amountColorClass = isCredit ? 'text-green' : 'text-red';
            const icon = isCredit ? '↓' : '↑';
            const iconBg = isCredit ? 'icon-green' : 'icon-red';

            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            transactionEl.innerHTML = `
                <div class="summary-card" style="gap: 1rem;">
                    <div class="card-icon ${iconBg}" style="width: 36px; height: 36px; font-size: 1rem;">${icon}</div>
                    <div class="transaction-details">
                        <p class="transaction-desc">${t.description}</p>
                        <p class="transaction-date">${parseLocalDate(t.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center;">
                     <p class="transaction-desc ${amountColorClass}">${isCredit ? '+' : '-'}${formatCurrency(t.amount)}</p>
                     <button class="delete-btn" data-id="${t.id}">&times;</button>
                </div>
            `;
            transactionListEl.appendChild(transactionEl);
        });
    }

    function renderPortfolio() {
        if (!portfolioBodyEl) return;
        portfolioBodyEl.innerHTML = '';
        portfolio.forEach(asset => {
            const changeColorClass = asset.change >= 0 ? 'text-green' : 'text-red';
            const changeSign = asset.change >= 0 ? '+' : '';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${asset.ticker}</div>
                    <div style="font-size: 0.8rem; color: #6b7280;">${asset.name}</div>
                </td>
                <td class="text-right">
                    <div style="font-weight: 600;">${formatCurrency(asset.price)}</div>
                </td>
                <td class="text-right ${changeColorClass}" style="font-weight: 500;">
                    ${changeSign}${asset.change.toFixed(2)}%
                </td>
            `;
            portfolioBodyEl.appendChild(row);
        });
    }

    function renderSpendingChart() {
        const canvas = document.getElementById('spendingChart');
        if (!canvas) return;
        const spendingData = transactions.filter(t => t.type === 'debit' && t.amount > 0).reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
        }, {});
        const categories = Object.keys(spendingData);
        const amounts = Object.values(spendingData);

        if (categories.length === 0) { if (myChart) { myChart.destroy(); myChart = null; } return; }
        const ctx = canvas.getContext('2d');
        if (myChart) myChart.destroy();

        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                    borderWidth: 0, hoverOffset: 10
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: { legend: { position: 'right', labels: { color: '#111827', usePointStyle: true, boxWidth: 8 } } }
            }
        });
    }

    function initLiveChart() {
        const canvas = document.getElementById('liveChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let price = 4500;
        const initialData = Array(20).fill(price);
        const initialLabels = Array(20).fill('');

        liveChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: initialLabels,
                datasets: [{
                    data: initialData, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                scales: { x: { display: false }, y: { display: false } },
                plugins: { legend: { display: false } }
            }
        });

        setInterval(() => {
            if (!liveChart) return;
            price += (Math.random() - 0.5) * 10;
            liveChart.data.datasets[0].data.push(price); liveChart.data.labels.push('');
            liveChart.data.datasets[0].data.shift(); liveChart.data.labels.shift();
            
            const prev = liveChart.data.datasets[0].data[18];
            const color = price >= prev ? '#10b981' : '#ef4444';
            const bg = price >= prev ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
            liveChart.data.datasets[0].borderColor = color;
            liveChart.data.datasets[0].backgroundColor = bg;
            liveChart.update();
        }, 1000);
    }

    // INTERACTIVE LOGIC
    function openModal() { modalOverlay.classList.remove('hidden'); }
    function closeModal() { modalOverlay.classList.add('hidden'); addTransactionForm.reset(); }
    
    if(openModalBtn) openModalBtn.addEventListener('click', openModal);
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

    // RESET FUNCTION 
    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            if(confirm('Are you sure you want to reset all data to default? This cannot be undone.')) {
                localStorage.removeItem('financeTrackerData');
                location.reload(); 
            }
        });
    }

    function addTransaction(e) {
        e.preventDefault();
        const desc = document.getElementById('description').value;
        const amt = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const cat = document.getElementById('category').value;
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        
        transactions.push({ id: Date.now(), description: desc, amount: amt, type: type, category: cat, date: dateStr });
        saveData(); 
        updateUI();
        closeModal();
    }
    
    function deleteTransaction(id) { 
        transactions = transactions.filter(t => t.id !== id); 
        saveData(); 
        updateUI(); 
    }

    function updateUI() { renderSummary(); renderTransactions(); renderSpendingChart(); }
    
    if(addTransactionForm) addTransactionForm.addEventListener('submit', addTransaction);
    if(transactionListEl) transactionListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) deleteTransaction(parseInt(e.target.dataset.id));
    });
    
    // INITIALIZE
    renderPortfolio(); 
    updateUI(); 
    initLiveChart(); 
    updatePortfolioPrices();
});