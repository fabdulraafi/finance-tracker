document.addEventListener('DOMContentLoaded', function() {
    
    const defaultData = [
        { id: 1, description: 'Monthly Salary', amount: 4500.00, type: 'credit', category: 'Income', date: '2025-10-01' },
        { id: 2, description: 'Grocery Shopping', amount: 155.75, type: 'debit', category: 'Food', date: '2025-10-02' },
        { id: 3, description: 'Spotify', amount: 10.99, type: 'debit', category: 'Entertainment', date: '2025-10-03' },
        { id: 4, description: 'Gasoline', amount: 45.50, type: 'debit', category: 'Transport', date: '2025-10-04' },
        { id: 5, description: 'Freelance', amount: 750.00, type: 'credit', category: 'Income', date: '2025-10-06' },
        { id: 6, description: 'Rent', amount: 250.00, type: 'debit', category: 'Housing', date: '2025-10-01' },
        { id: 7, description: 'Stock Div', amount: 55.40, type: 'credit', category: 'Investment', date: '2025-10-05' },
    ];

    const savedData = localStorage.getItem('financeTrackerData');
    let transactions = savedData ? JSON.parse(savedData) : defaultData;

    function saveData() {
        localStorage.setItem('financeTrackerData', JSON.stringify(transactions));
    }

    const portfolio = [
        { id: 1, name: 'Apple Inc.', ticker: 'AAPL', shares: 15, price: 175.20, change: 1.25 },
        { id: 2, name: 'Google', ticker: 'GOOGL', shares: 5, price: 140.80, change: -0.75 },
        { id: 3, name: 'Tesla', ticker: 'TSLA', shares: 8, price: 255.10, change: -1.10 },
        { id: 4, name: 'Vanguard', ticker: 'VOO', shares: 20, price: 410.70, change: 0.45 },
    ];

    // DOM elements
    const totalCreditsEl = document.getElementById('total-credits');
    const totalDebitsEl = document.getElementById('total-debits');
    const netBalanceEl = document.getElementById('net-balance');
    const transactionListEl = document.getElementById('transaction-list');
    const portfolioBodyEl = document.getElementById('portfolio-body');
    const addTransactionForm = document.getElementById('add-transaction-form');
    
    // Modal Elements
    const modalOverlay = document.getElementById('modal-overlay');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let myChart = null; 
    let liveChart = null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };
    
    const parseLocalDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // render functions
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
            const totalValue = asset.shares * asset.price;
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

        const spendingData = transactions
            .filter(t => t.type === 'debit' && t.amount > 0)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});
        
        const categories = Object.keys(spendingData);
        const amounts = Object.values(spendingData);

        if (categories.length === 0) {
            if (myChart) { myChart.destroy(); myChart = null; }
            return;
        }

        const ctx = canvas.getContext('2d');
        if (myChart) myChart.destroy();

        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { 
                            color: '#111827', 
                            font: { family: 'Inter', size: 12 },
                            usePointStyle: true,
                            boxWidth: 8
                        } 
                    }
                }
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
                    data: initialData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: { display: false },
                    y: { display: false } 
                },
                plugins: { legend: { display: false } }
            }
        });

        setInterval(() => {
            if (!liveChart) return;
            price += (Math.random() - 0.5) * 10;
            liveChart.data.datasets[0].data.push(price);
            liveChart.data.labels.push('');
            liveChart.data.datasets[0].data.shift();
            liveChart.data.labels.shift();
            
            const prev = liveChart.data.datasets[0].data[18];
            const color = price >= prev ? '#10b981' : '#ef4444';
            const bg = price >= prev ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
            
            liveChart.data.datasets[0].borderColor = color;
            liveChart.data.datasets[0].backgroundColor = bg;
            liveChart.update();
        }, 1000);
    }

    // modal logic
    function openModal() {
        modalOverlay.classList.remove('hidden');
    }

    function closeModal() {
        modalOverlay.classList.add('hidden');
        addTransactionForm.reset();
    }

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal if clicking outside the box
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // trasation logic
    function addTransaction(e) {
        e.preventDefault();
        const descriptionInput = document.getElementById('description');
        const amountInput = document.getElementById('amount');
        const typeInput = document.getElementById('type');
        const categoryInput = document.getElementById('category');

        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        
        const newTransaction = {
            id: Date.now(),
            description: descriptionInput.value,
            amount: parseFloat(amountInput.value),
            type: typeInput.value,
            category: categoryInput.value,
            date: dateStr
        };

        transactions.push(newTransaction);
        saveData(); 
        updateUI();
        closeModal(); // Close the modal after success
    }
    
    function deleteTransaction(id) {
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        updateUI();
    }

    function updateUI() {
        renderSummary();
        renderTransactions();
        renderSpendingChart();
    }
    
    addTransactionForm.addEventListener('submit', addTransaction);

    transactionListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteTransaction(parseInt(e.target.dataset.id));
        }
    });
    
    renderPortfolio();
    updateUI();
    initLiveChart();
});