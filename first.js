document.addEventListener('DOMContentLoaded', function() {
    let transactions = [
        { id: 1, description: 'Monthly Salary', amount: 4500.00, type: 'credit', category: 'Income', date: '2025-10-01' },
        { id: 2, description: 'Grocery Shopping', amount: 155.75, type: 'debit', category: 'Food', date: '2025-10-02' },
        { id: 3, description: 'Spotify Subscription', amount: 10.99, type: 'debit', category: 'Entertainment', date: '2025-10-03' },
        { id: 4, description: 'Gasoline', amount: 45.50, type: 'debit', category: 'Transport', date: '2025-10-04' },
        { id: 5, description: 'Dinner with Friends', amount: 85.20, type: 'debit', category: 'Social', date: '2025-10-05' },
        { id: 6, description: 'Freelance Project', amount: 750.00, type: 'credit', category: 'Income', date: '2025-10-06' },
        { id: 7, description: 'New Headphones', amount: 199.99, type: 'debit', category: 'Shopping', date: '2025-10-07' },
        { id: 8, description: 'Rent Payment', amount: 1200.00, type: 'debit', category: 'Housing', date: '2025-10-01' },
        { id: 9, description: 'Movie Tickets', amount: 25.00, type: 'debit', category: 'Entertainment', date: '2025-10-04' },
        { id: 10, description: 'Stock Dividend', amount: 55.40, type: 'credit', category: 'Investment', date: '2025-10-05' },
    ];

    const portfolio = [
        { id: 1, name: 'Apple Inc.', ticker: 'AAPL', shares: 15, price: 175.20, change: 1.25 },
        { id: 2, name: 'Google LLC', ticker: 'GOOGL', shares: 5, price: 140.80, change: -0.75 },
        { id: 3, name: 'NVIDIA Corp.', ticker: 'NVDA', shares: 10, price: 450.55, change: 2.15 },
        { id: 4, name: 'Tesla, Inc.', ticker: 'TSLA', shares: 8, price: 255.10, change: -1.10 },
        { id: 5, name: 'Vanguard S&P 500', ticker: 'VOO', shares: 20, price: 410.70, change: 0.45 },
    ];

    // declaring all elements from html
    const totalCreditsEl = document.getElementById('total-credits');
    const totalDebitsEl = document.getElementById('total-debits');
    const netBalanceEl = document.getElementById('net-balance');
    const transactionListEl = document.getElementById('transaction-list');
    const portfolioBodyEl = document.getElementById('portfolio-body');
    const canvas = document.getElementById('spendingChart');
    const ctx = canvas.getContext('2d');
    const addTransactionForm = document.getElementById('add-transaction-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const categoryInput = document.getElementById('category');
    const typeInput = document.getElementById('type');


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };
    
    // date
    const parseLocalDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // render

    function renderSummary() {
        const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalCredits - totalDebits;

        totalCreditsEl.textContent = formatCurrency(totalCredits);
        totalDebitsEl.textContent = formatCurrency(totalDebits);
        netBalanceEl.textContent = formatCurrency(netBalance);
    }

    function renderTransactions() {
        transactionListEl.innerHTML = '';
        const sortedTransactions = [...transactions].sort((a,b) => parseLocalDate(b.date) - parseLocalDate(a.date));

        sortedTransactions.forEach(t => {
            const isCredit = t.type === 'credit';
            const amountColorClass = isCredit ? 'credit' : 'debit';
            const icon = isCredit 
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            transactionEl.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-icon">${icon}</div>
                    <div>
                        <p class="transaction-desc">${t.description}</p>
                        <p class="transaction-date">${parseLocalDate(t.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="transaction-actions">
                     <p class="transaction-amount ${amountColorClass}">${isCredit ? '+' : '-'}${formatCurrency(t.amount)}</p>
                     <button class="delete-btn" data-id="${t.id}">&times;</button>
                </div>
            `;
            transactionListEl.appendChild(transactionEl);
        });
    }

    // investment
    function renderPortfolio() {
        portfolioBodyEl.innerHTML = '';
        portfolio.forEach(asset => {
            const totalValue = asset.shares * asset.price;
            const changeColorClass = asset.change >= 0 ? 'credit' : 'debit';
            const changeSign = asset.change >= 0 ? '+' : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="ticker">${asset.ticker}</div>
                    <div class="asset-name">${asset.name}</div>
                </td>
                <td class="text-right">
                    <div class="value-total">${formatCurrency(totalValue)}</div>
                    <div class="value-sub">${asset.shares} shares</div>
                </td>
                 <td class="text-right hide-sm">${formatCurrency(asset.price)}</td>
                <td class="text-right ${changeColorClass}">${changeSign}${asset.change.toFixed(2)}%</td>
            `;
            portfolioBodyEl.appendChild(row);
        });
    }

    // chart
    function renderSpendingChartFromScratch() {
        const spendingData = transactions
            .filter(t => t.type === 'debit' && t.amount > 0)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});
        
        const categories = Object.keys(spendingData);
        const amounts = Object.values(spendingData);
        const totalSpending = amounts.reduce((sum, amount) => sum + amount, 0);
        const colors = ['#34d399', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa', '#ec4899']; 

        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width;
        canvas.height = rect.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (categories.length === 0) {
            ctx.fillStyle = '#9ca3af';
            ctx.textAlign = 'center';
            ctx.font = "16px 'Inter'";
            ctx.fillText("No spending data to display.", canvas.width / 2, canvas.height / 2);
            return;
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        let startAngle = -0.5 * Math.PI; 

        categories.forEach((category, i) => {
            const sliceAngle = (amounts[i] / totalSpending) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            
            startAngle = endAngle;
        });
    }

    function addTransaction(e) {
        e.preventDefault();

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const day = String(today.getDate()).padStart(2, '0');
        
        const newTransaction = {
            id: Date.now(), 
            description: descriptionInput.value,
            amount: parseFloat(amountInput.value),
            type: typeInput.value,
            category: categoryInput.value,
            date: `${year}-${month}-${day}`
        };

        transactions.push(newTransaction);
        updateUI();
        addTransactionForm.reset();
    }
    
    function deleteTransaction(id) {
        transactions = transactions.filter(t => t.id !== id);
        updateUI();
    }

    function updateUI() {
        renderSummary();
        renderTransactions();
        renderSpendingChartFromScratch();
    }
    
    addTransactionForm.addEventListener('submit', addTransaction);

    transactionListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.dataset.id);
            deleteTransaction(id);
        }
    });
    
    window.addEventListener('resize', renderSpendingChartFromScratch);

    // dashboard
    renderPortfolio(); 
    updateUI(); 
});

