document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('payment-form').addEventListener('submit', event => {
        event.preventDefault();
        generatePDF();
    });
});

function updatePlanOptions() {
    const paymentOption = document.getElementById('payment-option').value;
    const planOptions = document.getElementById('plan-options');
    updatePaymentAmount();
    planOptions.style.display = (paymentOption === 'plan') ? 'block' : 'none';
}

function updatePaymentAmount() {
    const fine = parseFloat(document.getElementById('fine').value) || 0;
    const paymentOption = document.getElementById('payment-option').value;
    const installments = parseInt(document.getElementById('installments') ? document.getElementById('installments').value : 1, 10);
    const dueDate = document.getElementById('due-date').value;
    const amountDisplay = document.getElementById('amount-display');
    const dueDateDisplay = document.getElementById('due-date-display');

    if (!fine || !dueDate) {
        amountDisplay.textContent = '$0.00';
        dueDateDisplay.textContent = '';
        return;
    }

    let amount = 0;
    let paymentDetails = '';

    if (paymentOption === 'voluntary') {
        amount = fine * 0.5;
        paymentDetails = `Fecha límite: ${dueDate}`;
    } else if (paymentOption === 'plan') {
        amount = fine / installments;
        const dueDates = calculateDueDates(dueDate, installments);
        paymentDetails = 'Cuotas:<br>' + dueDates.map((date, index) => `Cuota ${index + 1}: ${date}`).join('<br>');
    }

    amountDisplay.textContent = `$${amount.toFixed(2)}`;
    dueDateDisplay.innerHTML = paymentDetails;
}

function calculateDueDates(startDate, installments) {
    const date = new Date(startDate);
    const dates = [];
    for (let i = 0; i < installments; i++) {
        const dueDate = new Date(date);
        dueDate.setMonth(date.getMonth() + i);
        dates.push(dueDate.toISOString().split('T')[0]);
    }
    return dates;
}

function refreshPage() {
    window.location.reload();
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const logoUrl = 'https://i.ibb.co/wMTnGM5/Dimensiones-personalizadas-200x200-px.jpg';  // URL del logo de tu empresa
    const accountDetails = 'Cuenta Bancaria:\nBanco: Nombre del Banco\nNúmero de Cuenta: 1234567890\nSWIFT: ABCD1234\nIBAN: XX1234567890';

    const name = document.getElementById('name').value;
    const pmNumber = document.getElementById('pm-number').value;
    const fine = document.getElementById('fine').value;
    const paymentOption = document.getElementById('payment-option').value;
    const installments = paymentOption === 'plan' ? document.getElementById('installments').value : '1';
    const dueDate = document.getElementById('due-date').value;
    const amountDisplay = document.getElementById('amount-display').textContent;
    const dueDateDisplay = document.getElementById('due-date-display').innerHTML;

    if (name && pmNumber && fine && paymentOption && dueDateDisplay) {
        doc.addImage(logoUrl, 'PNG', 10, 10, 50, 20);

        doc.text(`Nombre del Infractor: ${name}`, 10, 40);
        doc.text(`N° de PM: ${pmNumber}`, 10, 50);
        doc.text(`Monto de la Multa: $${fine}`, 10, 60);
        doc.text(`Opción de Pago: ${paymentOption === 'voluntary' ? 'Pago Voluntario' : `${installments} Cuota(s)`}`, 10, 70);
        doc.text(`Monto a Pagar: ${amountDisplay}`, 10, 80);
        
        doc.text('Detalles de Pago:', 10, 90);

        const dueDates = dueDateDisplay.split('<br>').map(line => line.split(': ')[1]);
        let tableBody = [];
        dueDates.forEach((date, index) => {
            tableBody.push([`Cuota ${index + 1}`, date, `$${(fine / installments).toFixed(2)}`]);
        });

        doc.autoTable({
            startY: 100,
            head: [['Cuota', 'Fecha de Vencimiento', 'Monto']],
            body: tableBody
        });

        doc.text(accountDetails, 10, doc.autoTable.previous.finalY + 10);

        doc.save(`Plan_de_Pago_${name}.pdf`);
    } else {
        alert('Por favor, complete todos los campos.');
    }
}

async function sendData() {
    const name = document.getElementById('name').value;
    const pmNumber = document.getElementById('pm-number').value;
    const fine = document.getElementById('fine').value;
    const paymentOption = document.getElementById('payment-option').value;
    const installments = paymentOption === 'plan' ? document.getElementById('installments').value : '1';
    const dueDate = document.getElementById('due-date').value;
    const email = document.getElementById('email').value;
    
    if (!name || !pmNumber || !fine || !paymentOption || !dueDate || !email) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const data = {
        name: name,
        pmNumber: pmNumber,
        fine: fine,
        paymentOption: paymentOption,
        installments: installments,
        dueDate: dueDate,
        email: email
    };

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwjFvC51HqSvvuxpk0qjFmKJrWAObiNP04bSAPas9mGNdcUVO2p88BKokKh2wjNV69YrQ/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.result === 'success') {
            alert('Datos enviados correctamente.');
        } else {
            alert('Error al enviar los datos.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar los datos.');
    }
}
