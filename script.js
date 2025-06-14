document.addEventListener('DOMContentLoaded', () => {
    // Pulsanti principali
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const searchCustomersBtn = document.getElementById('search-customers-btn');
    const manageCustomersBtn = document.getElementById('manage-customers-btn');

    // Sezioni dell'app
    const addCustomerSection = document.getElementById('add-customer-section');
    const searchCustomersSection = document.getElementById('search-customers-section');
    const searchMultipleStreetsSection = document.getElementById('search-multiple-streets-section');
    const manageCustomersSection = document.getElementById('manage-customers-section');

    // Elementi dei form e dei risultati
    const saveCustomerBtn = document.getElementById('save-customer-btn');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    const performSearchBtn = document.getElementById('perform-search-btn');
    const searchResultsDiv = document.getElementById('search-results');
    const cancelSearchBtn = document.getElementById('cancel-search-btn');
    const customerListDiv = document.getElementById('customer-list');
    const cancelManageBtn = document.getElementById('cancel-manage-btn');

    // Elementi per la ricerca multipla
    const multipleStreetsInput = document.getElementById('multiple-streets-input');
    const performMultipleStreetsSearchBtn = document.getElementById('perform-multiple-streets-search-btn');
    const multipleStreetsSearchResultsDiv = document.getElementById('multiple-streets-search-results');
    const cancelMultipleStreetsSearchBtn = document.getElementById('cancel-multiple-streets-search-btn');

    // Elementi del modal di modifica
    const editCustomerModal = document.getElementById('edit-customer-modal');
    const closeEditModalBtn = editCustomerModal.querySelector('.close-button');
    const editNameInput = document.getElementById('edit-name');
    const editPhoneInput = document.getElementById('edit-phone');
    const editStreetInput = document.getElementById('edit-street');
    const editCountryInput = document.getElementById('edit-country');
    const editDirectionsInput = document.getElementById('edit-directions');
    const updateCustomerBtn = document.getElementById('update-customer-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // NUOVI ELEMENTI DEL MENU
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebarSearchMultipleStreetsBtn = document.getElementById('sidebar-search-multiple-streets-btn'); // Pulsante nel menu
    const backupDataBtn = document.getElementById('backup-data-btn'); // Pulsante per il backup

    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    let currentEditingCustomerId = null;

    // Funzione per mostrare una sezione e nascondere le altre
    function showSection(section) {
        addCustomerSection.classList.add('hidden');
        searchCustomersSection.classList.add('hidden');
        searchMultipleStreetsSection.classList.add('hidden');
        manageCustomersSection.classList.add('hidden');
        editCustomerModal.classList.add('hidden'); // Nascondi il modal

        // Chiudi la sidebar quando cambi sezione
        sidebar.classList.remove('open');

        if (section) {
            section.classList.remove('hidden');
        }
    }

    // Event Listeners per i pulsanti principali
    addCustomerBtn.addEventListener('click', () => showSection(addCustomerSection));
    searchCustomersBtn.addEventListener('click', () => {
        document.getElementById('search-street').value = '';
        searchResultsDiv.innerHTML = '';
        showSection(searchCustomersSection);
    });
    manageCustomersBtn.addEventListener('click', () => {
        displayCustomers();
        showSection(manageCustomersSection);
    });

    // Event Listeners per i pulsanti di annullamento
    cancelAddBtn.addEventListener('click', () => showSection(null));
    cancelSearchBtn.addEventListener('click', () => showSection(null));
    cancelMultipleStreetsSearchBtn.addEventListener('click', () => showSection(null));
    cancelManageBtn.addEventListener('click', () => showSection(null));

    // Logica Menu
    menuIcon.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // Event Listener per il pulsante "Cerca Clienti per Lista Vie" nel menu
    sidebarSearchMultipleStreetsBtn.addEventListener('click', () => {
        multipleStreetsInput.value = '';
        multipleStreetsSearchResultsDiv.innerHTML = '';
        showSection(searchMultipleStreetsSection);
    });

    // Logica per il Backup Dati (CSV)
    backupDataBtn.addEventListener('click', () => {
        if (customers.length === 0) {
            alert('Nessun dato da esportare.');
            return;
        }

        // Crea l'header del CSV
        const headers = ['ID', 'Nome', 'Telefono', 'Via', 'Paese', 'Indicazioni'];
        let csvContent = headers.join(',') + '\n';

        // Aggiungi i dati dei clienti
        customers.forEach(customer => {
            const row = [
                `"${customer.id}"`, // Includi ID per completezza, tra virgolette per sicurezza
                `"${(customer.name || '').replace(/"/g, '""')}"`, // Gestisci virgolette doppie
                `"${(customer.phone || '').replace(/"/g, '""')}"`,
                `"${(customer.street || '').replace(/"/g, '""')}"`,
                `"${(customer.country || '').replace(/"/g, '""')}"`,
                `"${(customer.directions || '').replace(/"/g, '""')}"`
            ];
            csvContent += row.join(',') + '\n';
        });

        // Crea un Blob (Binary Large Object) con il contenuto CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Crea un URL per il Blob e un link per il download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Data e ora corrente per il nome del file
        const now = new Date();
        const dateString = now.getFullYear() + '-' +
                           (now.getMonth() + 1).toString().padStart(2, '0') + '-' +
                           now.getDate().toString().padStart(2, '0') + '_' +
                           now.getHours().toString().padStart(2, '0') + '-' +
                           now.getMinutes().toString().padStart(2, '0') + '-' +
                           now.getSeconds().toString().padStart(2, '0');

        a.download = `backup_clienti_${dateString}.csv`;
        document.body.appendChild(a); // Aggiungi al DOM temporaneamente
        a.click(); // Simula il click per avviare il download
        document.body.removeChild(a); // Rimuovi l'elemento
        URL.revokeObjectURL(url); // Libera la memoria
        alert('Backup dei dati generato con successo!');
        showSection(null); // Torna alla schermata principale
    });


    // Funzione per generare un ID univoco (timestamp)
    function generateUniqueId() {
        return Date.now().toString();
    }

    saveCustomerBtn.addEventListener('click', () => {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const street = document.getElementById('street').value.trim();
        const country = document.getElementById('country').value.trim();
        const directions = document.getElementById('directions').value.trim();

        if (name && street) {
            const newCustomer = {
                id: generateUniqueId(),
                name,
                phone,
                street,
                country,
                directions
            };
            customers.push(newCustomer);
            localStorage.setItem('customers', JSON.stringify(customers));
            alert('Cliente salvato!');
            // Resetta i campi del form
            document.getElementById('name').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('street').value = '';
            document.getElementById('country').value = '';
            document.getElementById('directions').value = '';

            showSection(null);
        } else {
            alert('Nome e Via sono obbligatori.');
        }
    });

    performSearchBtn.addEventListener('click', () => {
        const searchTerm = document.getElementById('search-street').value.toLowerCase().trim();
        const results = customers.filter(customer => customer.street.toLowerCase().includes(searchTerm));
        displaySearchResults(results, searchResultsDiv);
    });

    // Ricerca per Lista Vie
    performMultipleStreetsSearchBtn.addEventListener('click', () => {
        const inputStreetsText = multipleStreetsInput.value.trim();
        if (!inputStreetsText) {
            multipleStreetsSearchResultsDiv.innerHTML = '<p>Inserisci almeno una via per la ricerca.</p>';
            return;
        }

        const searchStreets = inputStreetsText.split('\n')
                                            .map(street => street.trim().toLowerCase())
                                            .filter(street => street.length > 0);

        if (searchStreets.length === 0) {
            multipleStreetsSearchResultsDiv.innerHTML = '<p>Nessuna via valida inserita per la ricerca.</p>';
            return;
        }

        let foundCustomers = [];
        // `matchedStreetsForGrouping` sarà un Set che conterrà le vie effettive dei clienti trovati,
        // per raggruppare i risultati correttamente.
        let matchedStreetsForGrouping = new Set();

        searchStreets.forEach(searchStreet => {
            customers.forEach(customer => {
                // Controlla se la via del cliente include la via di ricerca
                if (customer.street.toLowerCase().includes(searchStreet)) {
                    // Aggiungi il cliente solo se non è già stato aggiunto per questa ricerca multipla
                    if (!foundCustomers.some(c => c.id === customer.id)) {
                        foundCustomers.push(customer);
                    }
                    // Aggiungi la via effettiva del cliente al set per il raggruppamento
                    matchedStreetsForGrouping.add(customer.street);
                }
            });
        });

        // Ordina i risultati per via e poi per nome del cliente
        foundCustomers.sort((a, b) => {
            const streetComparison = a.street.localeCompare(b.street);
            if (streetComparison !== 0) {
                return streetComparison;
            }
            return a.name.localeCompare(b.name);
        });

        // Passa il set delle vie corrispondenti per il raggruppamento nella funzione di visualizzazione
        displaySearchResults(foundCustomers, multipleStreetsSearchResultsDiv, matchedStreetsForGrouping);
    });

    // Funzione modificata per essere riutilizzabile e gestire raggruppamento
    function displaySearchResults(results, targetDiv, groupResultsByStreet = null) {
        targetDiv.innerHTML = '';
        if (results.length === 0) {
            targetDiv.textContent = 'Nessun cliente trovato con i criteri di ricerca.';
        } else {
            if (groupResultsByStreet instanceof Set && groupResultsByStreet.size > 0) {
                // Raggruppa i clienti per la loro "Via" effettiva
                const groupedResults = {};
                results.forEach(customer => {
                    const customerStreet = customer.street;
                    if (!groupedResults[customerStreet]) {
                        groupedResults[customerStreet] = [];
                    }
                    groupedResults[customerStreet].push(customer);
                });

                // Ordina le vie raggruppate per visualizzazione (basandosi sul Set delle vie trovate)
                const sortedStreetsToDisplay = Array.from(groupResultsByStreet).sort((a, b) => a.localeCompare(b));

                sortedStreetsToDisplay.forEach(street => {
                    // Assicurati che ci siano clienti per questa via nel raggruppamento
                    if (groupedResults[street]) {
                        const streetHeader = document.createElement('h3');
                        streetHeader.textContent = `Via: ${street}`;
                        streetHeader.style.marginTop = '20px';
                        targetDiv.appendChild(streetHeader);

                        // Ordina i clienti all'interno di ogni via per nome
                        groupedResults[street].sort((a, b) => a.name.localeCompare(b.name));

                        groupedResults[street].forEach(customer => {
                            const customerDiv = document.createElement('div');
                            customerDiv.classList.add('customer-info');
                            customerDiv.innerHTML = `
                                <h4>${customer.name}</h4>
                                <p>Paese: ${customer.country || 'N.D.'}</p>
                                <p>Indicazioni: ${customer.directions || 'N.D.'}</p>
                                <p>Telefono: ${customer.phone || 'N.D.'}</p>
                            `;
                            targetDiv.appendChild(customerDiv);
                        });
                    }
                });

            } else {
                // Per la ricerca singola, mostra semplicemente l'elenco
                results.forEach(customer => {
                    const customerDiv = document.createElement('div');
                    customerDiv.classList.add('customer-info');
                    customerDiv.innerHTML = `
                        <h3>${customer.name}</h3>
                        <p>Via: ${customer.street}</p>
                        <p>Paese: ${customer.country || 'N.D.'}</p>
                        <p>Indicazioni: ${customer.directions || 'N.D.'}</p>
                        <p>Telefono: ${customer.phone || 'N.D.'}</p>
                    `;
                    targetDiv.appendChild(customerDiv);
                });
            }
        }
    }


    function displayCustomers() {
        customerListDiv.innerHTML = '';
        if (customers.length === 0) {
            customerListDiv.textContent = 'Nessun cliente salvato.';
        } else {
            customers.forEach(customer => {
                const customerDiv = document.createElement('div');
                customerDiv.classList.add('customer-info');
                customerDiv.innerHTML = `
                    <h3>${customer.name}</h3>
                    <p>Via: ${customer.street}</p>
                    <p>Telefono: ${customer.phone || 'N.D.'}</p>
                    <button class="edit-btn" data-id="${customer.id}">Modifica</button>
                    <button class="delete-btn" data-id="${customer.id}">Elimina</button>
                `;
                customerListDiv.appendChild(customerDiv);
            });
        }
    }

    // Event listener per i pulsanti Modifica ed Elimina (delegazione eventi)
    customerListDiv.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const customerId = event.target.dataset.id;
            openEditModal(customerId);
        } else if (event.target.classList.contains('delete-btn')) {
            const customerId = event.target.dataset.id;
            deleteCustomer(customerId);
        }
    });

    // Funzione per aprire il modal di modifica
    function openEditModal(customerId) {
        currentEditingCustomerId = customerId;
        const customerToEdit = customers.find(c => c.id === customerId);

        if (customerToEdit) {
            editNameInput.value = customerToEdit.name;
            editPhoneInput.value = customerToEdit.phone;
            editStreetInput.value = customerToEdit.street;
            editCountryInput.value = customerToEdit.country;
            editDirectionsInput.value = customerToEdit.directions;

            editCustomerModal.classList.remove('hidden');
        }
    }

    // Funzione per chiudere il modal di modifica
    closeEditModalBtn.addEventListener('click', () => {
        editCustomerModal.classList.add('hidden');
    });

    cancelEditBtn.addEventListener('click', () => {
        editCustomerModal.classList.add('hidden');
    });

    // Clic fuori dal modal per chiuderlo
    window.addEventListener('click', (event) => {
        if (event.target === editCustomerModal) {
            editCustomerModal.classList.add('hidden');
        }
    });

    // Funzione per salvare le modifiche del cliente
    updateCustomerBtn.addEventListener('click', () => {
        if (currentEditingCustomerId) {
            const index = customers.findIndex(c => c.id === currentEditingCustomerId);

            if (index !== -1) {
                const updatedName = editNameInput.value.trim();
                const updatedStreet = editStreetInput.value.trim();

                if (updatedName && updatedStreet) {
                    customers[index] = {
                        id: currentEditingCustomerId,
                        name: updatedName,
                        phone: editPhoneInput.value.trim(),
                        street: updatedStreet,
                        country: editCountryInput.value.trim(),
                        directions: editDirectionsInput.value.trim()
                    };
                    localStorage.setItem('customers', JSON.stringify(customers));
                    alert('Cliente modificato con successo!');
                    editCustomerModal.classList.add('hidden');
                    displayCustomers();
                } else {
                    alert('Nome e Via sono obbligatori per la modifica.');
                }
            }
        }
    });

    // Funzione per eliminare un cliente
    function deleteCustomer(customerId) {
        if (confirm('Sei sicuro di voler eliminare questo cliente? Questa operazione non può essere annullata.')) {
            customers = customers.filter(c => c.id !== customerId);
            localStorage.setItem('customers', JSON.stringify(customers));
            alert('Cliente eliminato con successo!');
            displayCustomers();
        }
    }
});
