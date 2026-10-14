/**
 * NEXUS - app.js
 * Frontend logic with tab switching (Infra, Corporate, SLA), detail drawers, CSV seeding, SLA reports, and dashboard filters
 */

// Application State
const state = {
    webAppUrl: localStorage.getItem('nexus_web_app_url') || '',
    isMockMode: localStorage.getItem('nexus_mock_mode') === 'true' || !localStorage.getItem('nexus_web_app_url'),
    activeTab: 'noc', // Default to 'noc' dashboard
    tickets: [], // Currently loaded tickets from DB
    customers: [], // Currently loaded customers from DB
    currentEditId: null, // Ticket ID currently focused
    
    // Dashboard filter state (Infra & Corporate)
    dashFilters: {
        activeOnly: false,
        startDate: '',
        endDate: '',
        activity: '',
        vendor: '',
        category: ''
    },
    
    // SLA filter states (SLA Tab)
    slaFilters: {
        customer: '',
        startDate: '',
        endDate: ''
    },

    // Executive Dashboard state (INFRA Ticket)
    execInfra: {
        startDate: '',
        endDate: '',
        tickets: [],
        filteredTickets: [],
        currentPage: 1,
        pageSize: 10,
        searchQuery: '',
        sortField: 'Start Time',
        sortAsc: false
    },

    // Executive Dashboard state (Corporate Ticket)
    execCorp: {
        startDate: '',
        endDate: '',
        tickets: [],
        filteredTickets: [],
        currentPage: 1,
        pageSize: 10,
        searchQuery: '',
        sortField: 'Start Time',
        sortAsc: false
    }
};

// DOM Elements
const elements = {
    appContainer: document.querySelector('.app-container'),
    nocDashboardSection: document.getElementById('noc-dashboard-section'),
    dashboardSection: document.getElementById('dashboard-section'),
    slaSection: document.getElementById('sla-section'),
    configSection: document.getElementById('config-section'),
    customerSection: document.getElementById('customer-section'),
    
    // Navigation Sidebar
    sidebar: document.getElementById('sidebar'),
    btnSidebarToggle: document.getElementById('btn-sidebar-toggle'),
    btnSidebarCollapse: document.getElementById('btn-sidebar-collapse'),
    btnFloatingSidebarToggle: document.getElementById('btn-floating-sidebar-toggle'),
    btnNocDashboard: document.getElementById('btn-noc-dashboard'),
    btnInfraTickets: document.getElementById('btn-infra-tickets'),
    btnCorporateTickets: document.getElementById('btn-corporate-tickets'),
    btnSlaDashboard: document.getElementById('btn-sla-dashboard'),
    btnDatabaseConfig: document.getElementById('btn-database-config'),
    btnCustomerDb: document.getElementById('btn-customer-db'),
    
    // Header Info
    sectionTitle: document.getElementById('section-title'),
    sectionSubtitle: document.getElementById('section-subtitle'),
    tableTitle: document.getElementById('table-title'),
    
    // Status
    dbConnectionBadge: document.getElementById('db-connection-badge'),
    connectionStatusText: document.getElementById('connection-status-text'),
    configWarning: document.getElementById('config-warning'),
    themeToggle: document.getElementById('theme-toggle'),
    
    // Table list & shortcuts
    ticketsTableList: document.getElementById('tickets-list'),
    tableSearch: document.getElementById('table-search'),
    btnAddTicketShortcut: document.getElementById('btn-add-ticket-shortcut'),
    
    // Dashboard Filters panel
    filterActiveOnly: document.getElementById('filter-active-only'),
    filterDashStartDate: document.getElementById('filter-dash-start-date'),
    filterDashEndDate: document.getElementById('filter-dash-end-date'),
    filterDashActivity: document.getElementById('filter-dash-activity'),
    filterDashVendor: document.getElementById('filter-dash-vendor'),
    filterDashCategory: document.getElementById('filter-dash-category'),
    btnResetDashFilters: document.getElementById('btn-reset-dash-filters'),
    btnApplyDashFilters: document.getElementById('btn-apply-dash-filters'),
    
    // Side Drawer Structure
    formDrawer: document.getElementById('form-drawer'),
    drawerOverlay: document.getElementById('drawer-overlay'),
    btnCloseDrawer: document.getElementById('btn-close-drawer'),
    btnEditTicketDrawer: document.getElementById('btn-edit-ticket-drawer'),
    drawerTitleText: document.getElementById('drawer-title-text'),
    
    // Drawer Content Views
    detailView: document.getElementById('drawer-detail-view'),
    formView: document.getElementById('drawer-form-view'),
    btnCancelFormView: document.getElementById('btn-cancel-form-view'),
    
    // Ticket Form Inputs
    ticketForm: document.getElementById('ticket-form'),
    inputTicketId: document.getElementById('input-ticket-id'),
    inputCustomerNameField: document.getElementById('input-customer-name-field'),
    formGroupCustomerName: document.getElementById('form-group-customer-name'),
    inputStartTime: document.getElementById('input-start-time'),
    inputEndTime: document.getElementById('input-end-time'),
    inputOnHold: document.getElementById('input-on-hold-duration'),
    inputActualDuration: document.getElementById('input-actual-duration'),
    inputSlaDuration: document.getElementById('input-sla-duration'),
    
    // SLA Filter Elements
    filterCustomerName: document.getElementById('filter-customer-name'),
    filterStartDate: document.getElementById('filter-start-date'),
    filterEndDate: document.getElementById('filter-end-date'),
    btnResetSla: document.getElementById('btn-reset-sla'),
    btnApplySla: document.getElementById('btn-apply-sla'),
    btnExportSlaCsv: document.getElementById('btn-export-sla-csv'),
    slaTicketsList: document.getElementById('sla-tickets-list'),
    
    // Database Config
    configUrlInput: document.getElementById('input-web-app-url'),
    btnSaveConfig: document.getElementById('btn-save-config'),
    btnUseMock: document.getElementById('btn-use-mock'),
    
    // Customer Tab DOMs
    customerTableList: document.getElementById('customer-list'),
    customerSearch: document.getElementById('customer-search'),
    btnAddCustomer: document.getElementById('btn-add-customer'),
    btnRefreshCustomers: document.getElementById('btn-refresh-customers'),
    customerDrawer: document.getElementById('customer-drawer'),
    customerDrawerTitle: document.getElementById('customer-drawer-title'),
    btnCloseCustomerDrawer: document.getElementById('btn-close-customer-drawer'),
    btnCancelCustomerDrawer: document.getElementById('btn-cancel-customer-drawer'),
    customerForm: document.getElementById('customer-form'),
    inputCustomerId: document.getElementById('input-customer-id'),
    inputCustomerName: document.getElementById('input-customer-name'),
    inputCustomerSegment: document.getElementById('input-customer-segment'),
    inputCustomerPic: document.getElementById('input-customer-pic'),
    inputCustomerContact: document.getElementById('input-customer-contact'),
    inputCustomerAddress: document.getElementById('input-customer-address'),
    inputCustomerStatus: document.getElementById('input-customer-status'),
    btnCustomerSubmitText: document.getElementById('btn-customer-submit-text'),
    

    // Executive Dashboard Dropdown Navigation
    navExecDropdown: document.getElementById('nav-exec-dropdown'),
    btnExecDropdownToggle: document.getElementById('btn-exec-dropdown-toggle'),
    execDropdownMenu: document.getElementById('exec-dropdown-menu'),
    
    // Executive Dashboard (INFRA Ticket)
    execInfraSection: document.getElementById('exec-infra-section'),
    btnExecInfraDashboard: document.getElementById('btn-exec-infra-dashboard'),
    execFilterStartDate: document.getElementById('exec-filter-start-date'),
    execFilterEndDate: document.getElementById('exec-filter-end-date'),
    btnExecApply: document.getElementById('btn-exec-apply'),
    btnExecReset: document.getElementById('btn-exec-reset'),
    execPeriodDisplay: document.getElementById('exec-period-display'),
    
    // Exec KPIs
    execKpiTotal: document.getElementById('exec-kpi-total'),
    execKpiTotalFoot: document.getElementById('exec-kpi-total-foot'),
    execKpiResolved: document.getElementById('exec-kpi-resolved'),
    execKpiResolvedFoot: document.getElementById('exec-kpi-resolved-foot'),
    execKpiOpen: document.getElementById('exec-kpi-open'),
    execKpiOpenFoot: document.getElementById('exec-kpi-open-foot'),
    execKpiCritical: document.getElementById('exec-kpi-critical'),
    execKpiCriticalFoot: document.getElementById('exec-kpi-critical-foot'),
    execKpiSla: document.getElementById('exec-kpi-sla'),
    execKpiSlaFoot: document.getElementById('exec-kpi-sla-foot'),
    execDonutSlaVal: document.getElementById('exec-donut-sla-val'),
    execSlaMetCnt: document.getElementById('exec-sla-met-cnt'),
    execSlaBreachCnt: document.getElementById('exec-sla-breach-cnt'),
    
    // Exec Detail Table
    execTableSummaryTitle: document.getElementById('exec-table-summary-title'),
    execTableSummarySub: document.getElementById('exec-table-summary-sub'),
    execTableSearch: document.getElementById('exec-table-search'),
    execTicketsTable: document.getElementById('exec-tickets-table'),
    execTicketsList: document.getElementById('exec-tickets-list'),
    execPaginationInfo: document.getElementById('exec-pagination-info'),
    btnExecPrev: document.getElementById('btn-exec-prev'),
    btnExecNext: document.getElementById('btn-exec-next'),
    execPageNum: document.getElementById('exec-page-num'),
    
    // Executive Dashboard (Corporate Ticket)
    execCorpSection: document.getElementById('exec-corp-section'),
    btnExecCorpDashboard: document.getElementById('btn-exec-corp-dashboard'),
    execCorpFilterStartDate: document.getElementById('exec-corp-filter-start-date'),
    execCorpFilterEndDate: document.getElementById('exec-corp-filter-end-date'),
    btnExecCorpApply: document.getElementById('btn-exec-corp-apply'),
    btnExecCorpReset: document.getElementById('btn-exec-corp-reset'),
    execCorpPeriodDisplay: document.getElementById('exec-corp-period-display'),
    
    // Exec Corp KPIs
    execCorpKpiTotal: document.getElementById('exec-corp-kpi-total'),
    execCorpKpiTotalFoot: document.getElementById('exec-corp-kpi-total-foot'),
    execCorpKpiResolved: document.getElementById('exec-corp-kpi-resolved'),
    execCorpKpiResolvedFoot: document.getElementById('exec-corp-kpi-resolved-foot'),
    execCorpKpiOpen: document.getElementById('exec-corp-kpi-open'),
    execCorpKpiOpenFoot: document.getElementById('exec-corp-kpi-open-foot'),
    execCorpKpiCritical: document.getElementById('exec-corp-kpi-critical'),
    execCorpKpiCriticalFoot: document.getElementById('exec-corp-kpi-critical-foot'),
    execCorpKpiSla: document.getElementById('exec-corp-kpi-sla'),
    execCorpKpiSlaFoot: document.getElementById('exec-corp-kpi-sla-foot'),
    execCorpDonutSlaVal: document.getElementById('exec-corp-donut-sla-val'),
    execCorpSlaMetCnt: document.getElementById('exec-corp-sla-met-cnt'),
    execCorpSlaBreachCnt: document.getElementById('exec-corp-sla-breach-cnt'),
    
    // Exec Corp Detail Table
    execCorpTableSummaryTitle: document.getElementById('exec-corp-table-summary-title'),
    execCorpTableSummarySub: document.getElementById('exec-corp-table-summary-sub'),
    execCorpTableSearch: document.getElementById('exec-corp-table-search'),
    execCorpTicketsTable: document.getElementById('exec-corp-tickets-table'),
    execCorpTicketsList: document.getElementById('exec-corp-tickets-list'),
    execCorpPaginationInfo: document.getElementById('exec-corp-pagination-info'),
    btnExecCorpPrev: document.getElementById('btn-exec-corp-prev'),
    btnExecCorpNext: document.getElementById('btn-exec-corp-next'),
    execCorpPageNum: document.getElementById('exec-corp-page-num'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.querySelector('.toast-message'),
    toastIcon: document.querySelector('.toast-icon')
};

// Mock Corporate Ticket Seeds
const mockCorporateSeeds = [
    {
        "Ticket ID": "CORP-001",
        "THC Ticket": "#THCMT2026065021",
        "Vendor Ticket": "",
        "Infra Category": "MPLS 100M",
        "Activity Type": "Incident",
        "Status": "Closed",
        "Severity": "Critical",
        "Vendor": "Bank Central Asia",
        "Site / POP": "Sudirman Jakarta",
        "Link / Device": "SID-882103",
        "Title": "BCA Sudirman MPLS Offline",
        "Start Time": "05/08/2026 09:15",
        "End Time": "05/08/2026 09:30",
        "Actual Duration": "00 Jam : 15 Menit",
        "On Hold Duration": "",
        "SLA Duration": "00 Jam : 15 Menit",
        "Root Cause L1": "Fiber",
        "Root Cause L2": "Kabel Putus",
        "Root Cause Detail": "Cable cut at drop point due to cleaning works inside the building riser.",
        "Action": "Spliced broken optical fiber patchcord at building central MDF room.",
        "Created By": "Alfo",
        "Closed By": "Alfo",
        "Timeline Docs": ""
    },
    {
        "Ticket ID": "CORP-002",
        "THC Ticket": "",
        "Vendor Ticket": "",
        "Infra Category": "IP Transit 1G",
        "Activity Type": "Incident",
        "Status": "Resolved",
        "Severity": "Major",
        "Vendor": "BPJS Kesehatan",
        "Site / POP": "Sunset Road Bali",
        "Link / Device": "SID-103328",
        "Title": "BPJS Bali WiFi Outage",
        "Start Time": "12/08/2026 14:00",
        "End Time": "12/08/2026 15:45",
        "Actual Duration": "01 Jam : 45 Menit",
        "On Hold Duration": "00 Jam : 15 Menit",
        "SLA Duration": "01 Jam : 30 Menit",
        "Root Cause L1": "Hardware",
        "Root Cause L2": "AP Faulty",
        "Root Cause Detail": "Access point lost power due to faulty PoE port on switch SW-02 Floor 2.",
        "Action": "Relocated AP cable connection to spare active PoE port. WiFi access restored.",
        "Created By": "Robin",
        "Closed By": "Robin",
        "Timeline Docs": ""
    },
    {
        "Ticket ID": "CORP-003",
        "THC Ticket": "#THCMT2026065099",
        "Vendor Ticket": "",
        "Infra Category": "SD-WAN Backup",
        "Activity Type": "CM",
        "Status": "Resolved",
        "Severity": "Minor",
        "Vendor": "Astra International",
        "Site / POP": "Sunter Jakarta",
        "Link / Device": "SID-009121",
        "Title": "Astra Sunter SD-WAN Packet Loss",
        "Start Time": "13/08/2026 02:30",
        "End Time": "13/08/2026 04:10",
        "Actual Duration": "01 Jam : 40 Menit",
        "On Hold Duration": "",
        "SLA Duration": "01 Jam : 40 Menit",
        "Root Cause L1": "Transmission",
        "Root Cause L2": "ISP Partner Issue",
        "Root Cause Detail": "ISP partner routing issue segment JKT-SBY causing 15% packet drop.",
        "Action": "Forced SD-WAN policy to route all critical traffic to secondary fiber link.",
        "Created By": "Syahrul",
        "Closed By": "Dani",
        "Timeline Docs": ""
    },
    {
        "Ticket ID": "CORP-004",
        "THC Ticket": "",
        "Vendor Ticket": "",
        "Infra Category": "Internet Access",
        "Activity Type": "Request",
        "Status": "Resolved",
        "Severity": "Low",
        "Vendor": "Bank Central Asia",
        "Site / POP": "Dago Bandung",
        "Link / Device": "SID-882103",
        "Title": "Dago Bandung AP Port Flapping",
        "Start Time": "14/08/2026 10:15",
        "End Time": "14/08/2026 10:35",
        "Actual Duration": "00 Jam : 20 Menit",
        "On Hold Duration": "",
        "SLA Duration": "00 Jam : 20 Menit",
        "Root Cause L1": "Logic",
        "Root Cause L2": "Port flap",
        "Root Cause Detail": "Switch Dago port AP-02 went into flapping state due to loop detection.",
        "Action": "Soft reset switch port, cleared network loop on table AP socket.",
        "Created By": "Alfo",
        "Closed By": "Alfo",
        "Timeline Docs": ""
    },
    {
        "Ticket ID": "CORP-005",
        "THC Ticket": "",
        "Vendor Ticket": "",
        "Infra Category": "IP Transit 1G",
        "Activity Type": "Incident",
        "Status": "Open",
        "Severity": "Major",
        "Vendor": "Astra International",
        "Site / POP": "Tanjung Priok Jkt",
        "Link / Device": "SID-009121",
        "Title": "Priok Branch Core Switch Down",
        "Start Time": "14/08/2026 12:45",
        "End Time": "",
        "Actual Duration": "Dalam Proses",
        "On Hold Duration": "",
        "SLA Duration": "Dalam Proses",
        "Root Cause L1": "Hardware",
        "Root Cause L2": "Power Module fault",
        "Root Cause Detail": "Power supply unit of stack member 1 failed.",
        "Action": "Dispatching hardware replacement by field engineer.",
        "Created By": "Alfo",
        "Closed By": "",
        "Timeline Docs": ""
    }
];

// ==========================================
// 1. NAVIGATION & TAB SWITCHING
// ==========================================
function navigateTab(tabName) {
    state.activeTab = tabName;
    closeDrawer();
    closeCustomerDrawer();
    
    // Remove active class from menu items
    elements.btnNocDashboard.classList.remove('active');
    elements.btnInfraTickets.classList.remove('active');
    elements.btnCorporateTickets.classList.remove('active');
    elements.btnSlaDashboard.classList.remove('active');
    elements.btnDatabaseConfig.classList.remove('active');
    elements.btnCustomerDb.classList.remove('active');
    if (elements.btnExecInfraDashboard) elements.btnExecInfraDashboard.classList.remove('active');
    if (elements.btnExecCorpDashboard) elements.btnExecCorpDashboard.classList.remove('active');
    if (elements.navExecDropdown) elements.navExecDropdown.classList.remove('has-active');
    
    // Hide sections
    elements.nocDashboardSection.classList.add('d-none');
    elements.dashboardSection.classList.add('d-none');
    elements.slaSection.classList.add('d-none');
    elements.configSection.classList.add('d-none');
    elements.customerSection.classList.add('d-none');
    if (elements.execInfraSection) elements.execInfraSection.classList.add('d-none');
    if (elements.execCorpSection) elements.execCorpSection.classList.add('d-none');
    
    // Reset filters state when switching tabs
    resetDashboardFiltersState();
    
    if (tabName === 'noc') {
        elements.btnNocDashboard.classList.add('active');
        elements.nocDashboardSection.classList.remove('d-none');
        elements.sectionTitle.textContent = "NOC Dashboard";
        elements.sectionSubtitle.textContent = "Status real-time dan ringkasan tiket gangguan";
        loadNocDashboard();
    } else if (tabName === 'infra') {
        elements.btnInfraTickets.classList.add('active');
        elements.dashboardSection.classList.remove('d-none');
        elements.sectionTitle.textContent = "Infra Tickets";
        elements.sectionSubtitle.textContent = "Daftar insiden jaringan dan infrastruktur";
        elements.tableTitle.textContent = "Daftar Tiket Jaringan";
        elements.inputTicketId.placeholder = "Contoh: INFRA-096";
        
        // Form & filters dynamic labels
        updateFormLabels();
        loadTickets();
    } else if (tabName === 'corporate') {
        elements.btnCorporateTickets.classList.add('active');
        elements.dashboardSection.classList.remove('d-none');
        elements.sectionTitle.textContent = "Corporate Tickets";
        elements.sectionSubtitle.textContent = "Daftar gangguan IT internal perkantoran";
        elements.tableTitle.textContent = "Daftar Tiket IT Korporat";
        elements.inputTicketId.placeholder = "Contoh: CORP-003";
        
        updateFormLabels();
        loadTickets();
    } else if (tabName === 'sla') {
        elements.btnSlaDashboard.classList.add('active');
        elements.slaSection.classList.remove('d-none');
        elements.sectionTitle.textContent = "SLA Dashboard";
        elements.sectionSubtitle.textContent = "Analisis kinerja penanganan insiden SLA Corporate";
        loadSlaReport();
    } else if (tabName === 'config') {
        elements.btnDatabaseConfig.classList.add('active');
        elements.configSection.classList.remove('d-none');
        elements.sectionTitle.textContent = "Pengaturan Database";
        elements.sectionSubtitle.textContent = "Hubungkan antarmuka dengan Google Sheets Anda";
    } else if (tabName === 'customer') {
        elements.btnCustomerDb.classList.add('active');
        elements.customerSection.classList.remove('d-none');
        elements.sectionTitle.textContent = "Master Customer";
        elements.sectionSubtitle.textContent = "Kelola database pelanggan korporat dan segmen";
        loadCustomers();
    } else if (tabName === 'exec-infra') {
        if (elements.btnExecInfraDashboard) elements.btnExecInfraDashboard.classList.add('active');
        if (elements.navExecDropdown) {
            elements.navExecDropdown.classList.add('open', 'has-active');
            if (elements.btnExecDropdownToggle) elements.btnExecDropdownToggle.setAttribute('aria-expanded', 'true');
        }
        if (elements.execInfraSection) elements.execInfraSection.classList.remove('d-none');
        elements.sectionTitle.textContent = "Executive Dashboard";
        elements.sectionSubtitle.textContent = "Ringkasan Eksekutif & Kinerja Operasional INFRA Ticket";
        loadExecInfraDashboard();
    } else if (tabName === 'exec-corp') {
        if (elements.btnExecCorpDashboard) elements.btnExecCorpDashboard.classList.add('active');
        if (elements.navExecDropdown) {
            elements.navExecDropdown.classList.add('open', 'has-active');
            if (elements.btnExecDropdownToggle) elements.btnExecDropdownToggle.setAttribute('aria-expanded', 'true');
        }
        if (elements.execCorpSection) elements.execCorpSection.classList.remove('d-none');
        elements.sectionTitle.textContent = "Executive Dashboard";
        elements.sectionSubtitle.textContent = "Ringkasan Eksekutif & Kinerja Operasional Corporate Ticket";
        loadExecCorpDashboard();
    }
}

// Sidebar Collapse Toggle Logic
function toggleSidebar(forceState = null) {
    const isCurrentlyCollapsed = elements.appContainer.classList.contains('sidebar-collapsed');
    const shouldCollapse = forceState !== null ? forceState : !isCurrentlyCollapsed;
    
    if (shouldCollapse) {
        elements.appContainer.classList.add('sidebar-collapsed');
        localStorage.setItem('nexus_sidebar_collapsed', 'true');
        showToast("Menu samping diciutkan (Tampilan Penuh)", "info");
    } else {
        elements.appContainer.classList.remove('sidebar-collapsed');
        localStorage.setItem('nexus_sidebar_collapsed', 'false');
        showToast("Menu samping ditampilkan", "info");
    }

    // Trigger window resize so Chart.js charts redraw to perfectly fill width
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 320);
}

if (elements.btnSidebarToggle) {
    elements.btnSidebarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSidebar();
    });
}
if (elements.btnSidebarCollapse) {
    elements.btnSidebarCollapse.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSidebar(true);
    });
}
if (elements.btnFloatingSidebarToggle) {
    elements.btnFloatingSidebarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSidebar(false);
    });
}

// Bind Navigation clicks
if (elements.btnExecDropdownToggle) {
    elements.btnExecDropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        if (elements.navExecDropdown) {
            const isOpen = elements.navExecDropdown.classList.toggle('open');
            elements.btnExecDropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
    });
}
elements.btnNocDashboard.addEventListener('click', (e) => { e.preventDefault(); navigateTab('noc'); });
elements.btnInfraTickets.addEventListener('click', (e) => { e.preventDefault(); navigateTab('infra'); });
elements.btnCorporateTickets.addEventListener('click', (e) => { e.preventDefault(); navigateTab('corporate'); });
elements.btnSlaDashboard.addEventListener('click', (e) => { e.preventDefault(); navigateTab('sla'); });
elements.btnDatabaseConfig.addEventListener('click', (e) => { e.preventDefault(); navigateTab('config'); });
elements.btnCustomerDb.addEventListener('click', (e) => { e.preventDefault(); navigateTab('customer'); });
if (elements.btnExecInfraDashboard) {
    elements.btnExecInfraDashboard.addEventListener('click', (e) => { e.preventDefault(); navigateTab('exec-infra'); });
}
if (elements.btnExecCorpDashboard) {
    elements.btnExecCorpDashboard.addEventListener('click', (e) => { e.preventDefault(); navigateTab('exec-corp'); });
}

// ==========================================
// 2. DYNAMIC LABELLING (INFRA VS CORP)
// ==========================================
function updateFormLabels() {
    const isCorp = state.activeTab === 'corporate' || state.activeTab === 'exec-corp';
    
    // Dynamic table head headers for main tickets table
    const tableHead = document.querySelector('#tickets-table thead tr');
    if (tableHead) {
        if (isCorp) {
            tableHead.innerHTML = `
                <th>Ticket ID</th>
                <th>Customer Name</th>
                <th>Service ID</th>
                <th>Site Name</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Durasi</th>
                <th>Aksi</th>
            `;
        } else {
            tableHead.innerHTML = `
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Site / POP</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Aksi</th>
            `;
        }
    }
    
    // Dashboard Filters Dynamic labels
    document.getElementById('label-dash-vendor').textContent = isCorp ? "Customer Name" : "Vendor";
    document.getElementById('label-dash-category').textContent = isCorp ? "Service Type" : "Category";
    
    // Form Input Labels & Placeholders
    const groupCust = elements.formGroupCustomerName;
    const inputCust = elements.inputCustomerNameField;
    
    if (isCorp) {
        if (groupCust) groupCust.classList.remove('d-none');
        if (inputCust) inputCust.setAttribute('required', 'required');
        
        document.getElementById('label-vendor').textContent = "Vendor";
        document.getElementById('input-vendor').placeholder = "Contoh: Telkom, Indosat, PLN";
    } else {
        if (groupCust) groupCust.classList.add('d-none');
        if (inputCust) {
            inputCust.removeAttribute('required');
            inputCust.value = '';
        }
        
        document.getElementById('label-vendor').textContent = "Vendor";
        document.getElementById('input-vendor').placeholder = "Contoh: Internal, PLN, Telkom";
    }
    
    document.getElementById('label-site-pop').textContent = isCorp ? "Site Name" : "Site / POP";
    document.getElementById('input-site-pop').placeholder = isCorp ? "Contoh: Sudirman Jakarta, Bali Sunset" : "Contoh: Sui Duri";
    
    document.getElementById('label-link-device').textContent = isCorp ? "Service ID" : "Link / Device";
    document.getElementById('input-link-device').placeholder = isCorp ? "Contoh: SID-882103" : "Contoh: POP Sui Duri Down";
    
    document.getElementById('label-infra-category').textContent = isCorp ? "Service Type" : "Category";
    
    document.getElementById('form-location-group-title').innerHTML = isCorp 
        ? `<i class="fa-solid fa-circle-info"></i> 2. Status & Customer`
        : `<i class="fa-solid fa-circle-info"></i> 2. Status & Lokasi`;

    // Detail Drawer Labels
    document.getElementById('detail-vendor-label').textContent = "Vendor";
    document.getElementById('detail-site-label').textContent = isCorp ? "Site Name" : "Site / POP";
    document.getElementById('detail-link-label').textContent = isCorp ? "Service ID" : "Link / Device";
    document.getElementById('detail-category-label').textContent = isCorp ? "Service Type" : "Category";
    
    document.getElementById('detail-location-group-title').innerHTML = isCorp 
        ? `<i class="fa-solid fa-circle-info"></i> Detail Customer & Status`
        : `<i class="fa-solid fa-circle-info"></i> Detail Status & Lokasi`;
        
    populateAutocompleteSuggestions();
}

// ==========================================
// 3. DRAWER CONTROL: DETAIL MODE & FORM MODE
// ==========================================
function openDetailDrawer(ticketId) {
    const ticket = state.tickets.find(t => t["Ticket ID"] === ticketId);
    if (!ticket) return;
    
    state.currentEditId = ticketId;
    updateFormLabels();
    
    // Switch elements visibility
    elements.detailView.classList.remove('d-none');
    elements.formView.classList.add('d-none');
    elements.btnEditTicketDrawer.classList.remove('d-none');
    elements.drawerTitleText.textContent = "Detail Tiket Insiden";
    
    // Map data to DOM
    document.getElementById('detail-ticket-id').textContent = ticket["Ticket ID"] || '-';
    document.getElementById('detail-title').textContent = ticket["Title"] || 'Tanpa Judul';
    
    const statusEl = document.getElementById('detail-status');
    statusEl.textContent = ticket["Status"] || 'Open';
    statusEl.className = `badge badge-${(ticket["Status"] || 'Open').toLowerCase().replace(/\s+/g, '')}`;
    
    const severityEl = document.getElementById('detail-severity');
    severityEl.textContent = ticket["Severity"] || 'Low';
    severityEl.className = `badge badge-${(ticket["Severity"] || 'Low').toLowerCase()}`;
    
    document.getElementById('detail-thc-ticket').textContent = ticket["THC Ticket"] || '-';
    document.getElementById('detail-vendor-ticket').textContent = ticket["Vendor Ticket"] || '-';
    document.getElementById('detail-activity-type').textContent = ticket["Activity Type"] || '-';

    const isCorpTicket = (ticket["Ticket ID"] || "").startsWith('CORP-') || state.activeTab === 'corporate' || state.activeTab === 'exec-corp';
    const rowCustomerName = document.getElementById('detail-row-customer-name');
    
    if (isCorpTicket) {
        if (rowCustomerName) rowCustomerName.classList.remove('d-none');
        document.getElementById('detail-customer-name').textContent = ticket["Customer Name"] || '-';
        document.getElementById('detail-vendor').textContent = ticket["Vendor"] || '-';
        document.getElementById('detail-vendor-label').textContent = "Vendor";
        document.getElementById('detail-site-pop').textContent = ticket["Site Name"] || '-';
        document.getElementById('detail-link-device').textContent = ticket["Service ID"] || '-';
        document.getElementById('detail-category').textContent = ticket["Service Type"] || '-';
    } else {
        if (rowCustomerName) rowCustomerName.classList.add('d-none');
        document.getElementById('detail-vendor').textContent = ticket["Vendor"] || '-';
        document.getElementById('detail-vendor-label').textContent = "Vendor";
        document.getElementById('detail-site-pop').textContent = ticket["Site / POP"] || '-';
        document.getElementById('detail-link-device').textContent = ticket["Link / Device"] || '-';
        document.getElementById('detail-category').textContent = ticket["Infra Category"] || '-';
    }
    document.getElementById('detail-start-time').textContent = formatDateTimeString(ticket["Start Time"]);
    document.getElementById('detail-end-time').textContent = formatDateTimeString(ticket["End Time"]);
    document.getElementById('detail-on-hold-duration').textContent = formatDurationString(ticket["On Hold Duration"]);
    document.getElementById('detail-actual-duration').textContent = getCleanDuration(ticket);
    document.getElementById('detail-sla-duration').textContent = getCleanSlaDuration(ticket);
    
    document.getElementById('detail-root-cause-l1').textContent = ticket["Root Cause L1"] || '-';
    document.getElementById('detail-root-cause-l2').textContent = ticket["Root Cause L2"] || '-';
    document.getElementById('detail-root-cause-detail').textContent = ticket["Root Cause Detail"] || '-';
    document.getElementById('detail-action').textContent = ticket["Action"] || '-';
    
    document.getElementById('detail-created-by').textContent = ticket["Created By"] || '-';
    document.getElementById('detail-closed-by').textContent = ticket["Closed By"] || '-';
    
    const docsLink = document.getElementById('detail-timeline-docs');
    if (ticket["Timeline Docs"] && ticket["Timeline Docs"].startsWith('http')) {
        docsLink.href = ticket["Timeline Docs"];
        docsLink.style.display = "inline-flex";
    } else {
        docsLink.style.display = "none";
    }
    
    // Slide Open
    elements.formDrawer.classList.add('open');
    elements.drawerOverlay.classList.remove('d-none');
    elements.appContainer.classList.add('drawer-active');
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 320);
}

function openEditFormDrawer(ticketId = null) {
    state.currentEditId = ticketId;
    updateFormLabels();
    
    elements.detailView.classList.add('d-none');
    elements.formView.classList.remove('d-none');
    elements.btnEditTicketDrawer.classList.add('d-none');
    
    if (ticketId) {
        elements.drawerTitleText.textContent = `Edit Tiket: ${ticketId}`;
        populateForm(ticketId);
    } else {
        elements.drawerTitleText.textContent = "Buat Tiket Baru";
        resetForm();
        
        let prefix = state.activeTab === 'infra' ? 'INFRA-' : 'CORP-';
        let maxNum = 0;
        state.tickets.forEach(t => {
            if (t["Ticket ID"] && t["Ticket ID"].startsWith(prefix)) {
                let num = parseInt(t["Ticket ID"].replace(prefix, ""), 10);
                if (num > maxNum) maxNum = num;
            }
        });
        elements.inputTicketId.value = prefix + String(maxNum + 1).padStart(3, '0');
    }
    
    elements.formDrawer.classList.add('open');
    elements.drawerOverlay.classList.remove('d-none');
    elements.appContainer.classList.add('drawer-active');
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 320);
}

function closeDrawer() {
    elements.formDrawer.classList.remove('open');
    elements.drawerOverlay.classList.add('d-none');
    elements.appContainer.classList.remove('drawer-active');
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 320);
}

// Bind drawer detail switches
elements.btnEditTicketDrawer.addEventListener('click', () => {
    if (state.currentEditId) openEditFormDrawer(state.currentEditId);
});

elements.btnCancelFormView.addEventListener('click', () => {
    if (state.currentEditId) openDetailDrawer(state.currentEditId);
    else closeDrawer();
});

elements.btnCloseDrawer.addEventListener('click', closeDrawer);
elements.drawerOverlay.addEventListener('click', closeDrawer);
elements.btnAddTicketShortcut.addEventListener('click', () => openEditFormDrawer(null));

// ==========================================
// 4. THEME TOGGLE LOGIC
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('nexus_theme') || 'dark';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        elements.themeToggle.checked = true;
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        elements.themeToggle.checked = false;
    }
}

elements.themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        localStorage.setItem('nexus_theme', 'dark');
        showToast("Beralih ke Mode Gelap", "info");
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        localStorage.setItem('nexus_theme', 'light');
        showToast("Beralih ke Mode Terang", "info");
    }
    if (state.activeTab === 'exec-infra' && typeof updateExecInfraDashboard === 'function') {
        updateExecInfraDashboard();
    }
    if (state.activeTab === 'exec-corp' && typeof updateExecCorpDashboard === 'function') {
        updateExecCorpDashboard();
    }
});

// ==========================================
// 5. TOAST NOTIFICATIONS
// ==========================================
let toastTimeout;
function showToast(message, type = 'info') {
    clearTimeout(toastTimeout);
    elements.toast.className = `toast ${type}`;
    elements.toastMessage.textContent = message;
    elements.toastIcon.className = 'toast-icon fa-solid ';
    if (type === 'success') elements.toastIcon.classList.add('fa-circle-check');
    else if (type === 'error') elements.toastIcon.classList.add('fa-circle-xmark');
    else elements.toastIcon.classList.add('fa-circle-info');
    elements.toast.classList.remove('hidden');
    toastTimeout = setTimeout(() => { elements.toast.classList.add('hidden'); }, 4000);
}

// ==========================================
// 6. CSV DATA SEEDING (FOR MOCK DATABASE)
// ==========================================
function parseCSV(text) {
    const lines = [];
    let row = [""];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const next = text[i+1];
        if (c === '"') {
            if (inQuotes && next === '"') { row[row.length - 1] += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (c === ',' && !inQuotes) { row.push(''); }
        else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') { i++; }
            lines.push(row); row = [''];
        } else { row[row.length - 1] += c; }
    }
    if (row.length > 1 || row[0] !== '') { lines.push(row); }
    return lines;
}

async function seedDatabaseFromCSV() {
    try {
        const response = await fetch('TICKETING SYSTEM - INFRA TICKET.csv');
        if (!response.ok) return false;
        const csvText = await response.text();
        const csvLines = parseCSV(csvText);
        if (csvLines.length <= 1) return false;
        const headers = csvLines[0].map(h => h.trim());
        const seededTickets = [];
        for (let i = 1; i < csvLines.length; i++) {
            const row = csvLines[i];
            if (row.length < headers.length || !row[0]) continue;
            const ticket = {};
            headers.forEach((header, index) => {
                ticket[header] = row[index] ? row[index].trim() : '';
            });
            seededTickets.push(ticket);
        }
        if (seededTickets.length > 0) {
            localStorage.setItem('nexus_mock_tickets', JSON.stringify(seededTickets));
            return true;
        }
    } catch (err) {
        console.error("Failed to seed from CSV file:", err);
    }
    return false;
}

// Seed mock corporate database in localStorage
if (!localStorage.getItem('nexus_corporate_tickets')) {
    localStorage.setItem('nexus_corporate_tickets', JSON.stringify(mockCorporateSeeds));
}

// Seed mock customer database in localStorage
const mockCustomerSeeds = [
    { "Customer ID": "CUST-001", "Customer Name": "Dinas Kesehatan Kabupaten Kubu Raya", "Segment": "Government", "PIC Name": "Budi Hartono", "PIC Contact": "081234567890", "Address": "Jl. Arteri Supadio No. 10, Kubu Raya", "Status": "Active" },
    { "Customer ID": "CUST-002", "Customer Name": "Dinas Kominfo Kabupaten Pontianak", "Segment": "Government", "PIC Name": "Siti Rahma", "PIC Contact": "siti.rahma@dinkes.go.id", "Address": "Jl. Ahmad Yani No. 5, Pontianak", "Status": "Active" },
    { "Customer ID": "CUST-003", "Customer Name": "PT Bank Pembangunan Daerah Kalbar", "Segment": "Finance", "PIC Name": "Indra Wijaya", "PIC Contact": "08119876543", "Address": "Jl. Rahadi Usman No. 1, Pontianak", "Status": "Active" }
];
if (!localStorage.getItem('nexus_customers')) {
    localStorage.setItem('nexus_customers', JSON.stringify(mockCustomerSeeds));
}

// ==========================================
// 7. DB CONNECTION SETUP
// ==========================================
function updateConnectionBadge() {
    if (state.isMockMode) {
        elements.dbConnectionBadge.className = "connection-status offline";
        elements.connectionStatusText.textContent = "Offline (Luring CSV)";
        elements.configWarning.classList.remove('d-none');
    } else {
        elements.dbConnectionBadge.className = "connection-status online";
        elements.connectionStatusText.textContent = "Terhubung (Sheets)";
        elements.configWarning.classList.add('d-none');
    }
}

elements.btnSaveConfig.addEventListener('click', async () => {
    const url = elements.configUrlInput.value.trim();
    if (!url || !url.startsWith('https://script.google.com/')) {
        showToast("Mohon masukkan Web App URL yang valid!", "error");
        return;
    }
    
    if (!url.includes('/exec')) {
        showToast("Peringatan: URL harus berakhiran '/exec'. Pastikan Anda men-deploy sebagai Web App!", "warning");
    }

    elements.btnSaveConfig.disabled = true;
    const originalText = elements.btnSaveConfig.innerHTML;
    elements.btnSaveConfig.innerHTML = `<span>Menghubungkan...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

    try {
        // Test connection by fetching Tickets
        const response = await fetch(`${url}?action=readAll&sheet=Tickets`);
        if (!response.ok) throw new Error("Server HTTP Error: " + response.status);
        const result = await response.json();
        
        if (result.status === "success") {
            state.webAppUrl = url;
            state.isMockMode = false;
            localStorage.setItem('nexus_web_app_url', url);
            localStorage.setItem('nexus_mock_mode', 'false');
            updateConnectionBadge();
            showToast("Berhasil terhubung ke database Google Sheets!", "success");
            navigateTab(state.activeTab);
        } else {
            throw new Error(result.message || "Respon Apps Script tidak sukses.");
        }
    } catch (error) {
        console.error("Database connection test failed:", error);
        
        const forceSave = confirm(
            "Nexus gagal memverifikasi koneksi ke URL Google Apps Script tersebut.\n\n" +
            "Penyebab umum:\n" +
            "1. Proyek Apps Script belum di-deploy dengan akses 'Anyone' (Siapa saja).\n" +
            "2. URL editor (/edit) dimasukkan alih-alih URL Web App (/exec).\n" +
            "3. Koneksi internet Anda sedang terganggu.\n\n" +
            "Apakah Anda tetap ingin memaksa menyimpan konfigurasi URL ini?"
        );
        
        if (forceSave) {
            state.webAppUrl = url;
            state.isMockMode = false;
            localStorage.setItem('nexus_web_app_url', url);
            localStorage.setItem('nexus_mock_mode', 'false');
            updateConnectionBadge();
            showToast("Konfigurasi disimpan secara paksa.", "warning");
            navigateTab(state.activeTab);
        } else {
            showToast("Koneksi dibatalkan. Menggunakan database offline.", "info");
        }
    } finally {
        elements.btnSaveConfig.disabled = false;
        elements.btnSaveConfig.innerHTML = originalText;
    }
});

elements.btnUseMock.addEventListener('click', () => {
    state.isMockMode = true;
    localStorage.setItem('nexus_mock_mode', 'true');
    updateConnectionBadge();
    showToast("Beralih ke modus database offline.", "info");
    navigateTab(state.activeTab);
});

// ==========================================
// 8. DASHBOARD LIVE FILTER CONTROLS
// ==========================================
function resetDashboardFiltersState() {
    state.dashFilters.activeOnly = false;
    state.dashFilters.startDate = '';
    state.dashFilters.endDate = '';
    state.dashFilters.activity = '';
    state.dashFilters.vendor = '';
    state.dashFilters.category = '';
    
    // Reset DOM values
    if (elements.filterDashStartDate) elements.filterDashStartDate.value = '';
    if (elements.filterDashEndDate) elements.filterDashEndDate.value = '';
    if (elements.filterDashActivity) elements.filterDashActivity.value = '';
    if (elements.filterDashVendor) elements.filterDashVendor.value = '';
    if (elements.filterDashCategory) elements.filterDashCategory.value = '';
}

function applyDashboardFilters() {
    state.dashFilters.activeOnly = false; // Disabled by user default
    state.dashFilters.startDate = elements.filterDashStartDate.value;
    state.dashFilters.endDate = elements.filterDashEndDate.value;
    state.dashFilters.activity = elements.filterDashActivity.value;
    state.dashFilters.vendor = elements.filterDashVendor.value;
    state.dashFilters.category = elements.filterDashCategory.value;
    
    showToast("Penyaringan tiket diterapkan.", "success");
    loadTickets();
}

elements.btnApplyDashFilters.addEventListener('click', applyDashboardFilters);
elements.btnResetDashFilters.addEventListener('click', () => {
    resetDashboardFiltersState();
    showToast("Filter disetel ulang.", "info");
    loadTickets();
});

// Populate dropdown values dynamically based on loaded data
function populateDashboardFilterSelectors(dataList) {
    const isCorp = state.activeTab === 'corporate';
    
    // Extract unique Vendors and Categories
    const uniqueVendors = [...new Set(dataList.map(t => t["Vendor"]).filter(Boolean))].sort();
    const uniqueCategories = [...new Set(dataList.map(t => t["Infra Category"]).filter(Boolean))].sort();
    
    const prevVendor = elements.filterDashVendor.value;
    const prevCategory = elements.filterDashCategory.value;
    
    // Set default labels
    elements.filterDashVendor.innerHTML = `<option value="">Semua ${isCorp ? 'Customer' : 'Vendor'}</option>`;
    elements.filterDashCategory.innerHTML = `<option value="">Semua ${isCorp ? 'Layanan' : 'Kategori'}</option>`;
    
    uniqueVendors.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        elements.filterDashVendor.appendChild(opt);
    });
    
    uniqueCategories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        elements.filterDashCategory.appendChild(opt);
    });
    
    // Restore previous selections if they still exist
    if (uniqueVendors.includes(prevVendor)) elements.filterDashVendor.value = prevVendor;
    if (uniqueCategories.includes(prevCategory)) elements.filterDashCategory.value = prevCategory;
}

// ==========================================
// 9. TICKETS CRUD
// ==========================================
async function loadTickets() {
    elements.ticketsTableList.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                <div class="empty-state">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <p>Mengambil data tiket...</p>
                </div>
            </td>
        </tr>
    `;

    const dbKey = state.activeTab === 'infra' ? 'nexus_mock_tickets' : 'nexus_corporate_tickets';

    if (state.isMockMode) {
        try {
            let data = JSON.parse(localStorage.getItem(dbKey)) || [];
            if (data.length === 0 && state.activeTab === 'infra') {
                const seeded = await seedDatabaseFromCSV();
                if (seeded) {
                    data = JSON.parse(localStorage.getItem(dbKey)) || [];
                }
            }
            state.tickets = data.map(normalizeTicketData);
            
            // 1. Calculate and update stats cards based on FULL raw database
            updateStats(state.tickets);
            
            // 2. Populate filter selectors based on FULL raw database
            populateDashboardFilterSelectors(state.tickets);
            
            // 3. Apply all filter constraints to generate display list
            const filtered = filterDataset(state.tickets);
            renderTicketsTable(filtered);
        } catch (e) {
            showToast("Gagal memuat data lokal", "error");
        }
    } else {
        // Tampilkan data cache lokal secara instan terlebih dahulu (0 ms delay)
        let hasCache = false;
        try {
            const cachedData = JSON.parse(localStorage.getItem(dbKey)) || [];
            if (cachedData.length > 0) {
                state.tickets = cachedData.map(normalizeTicketData);
                updateStats(state.tickets);
                populateDashboardFilterSelectors(state.tickets);
                const filtered = filterDataset(state.tickets);
                renderTicketsTable(filtered);
                hasCache = true;
            }
        } catch (e) {
            console.warn("Gagal membaca cache lokal:", e);
        }

        // Lakukan sinkronisasi data online dari Google Sheets di latar belakang
        try {
            const sheetParam = state.activeTab === 'infra' ? 'Tickets' : 'Corporate';
            const response = await fetch(`${state.webAppUrl}?action=readAll&sheet=${sheetParam}`);
            if (!response.ok) throw new Error("Gagal menyambung");
            const result = await response.json();
            if (result.status === "success") {
                state.tickets = result.data.map(normalizeTicketData);
                
                // Perbarui cache lokal dengan data terbaru
                localStorage.setItem(dbKey, JSON.stringify(result.data));
                
                updateStats(state.tickets);
                populateDashboardFilterSelectors(state.tickets);
                
                const filtered = filterDataset(state.tickets);
                renderTicketsTable(filtered);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error("Gagal sinkronisasi data online:", error);
            if (!hasCache) {
                showToast("Gagal memuat data online. Menggunakan database luring.", "error");
                state.isMockMode = true;
                updateConnectionBadge();
                loadTickets();
            }
        }
    }
}

// Core filtering logic for Dashboard Tab
function filterDataset(fullList) {
    let list = [...fullList];
    
    // Status Filter (Hanya Tiket Aktif)
    if (state.dashFilters.activeOnly) {
        list = list.filter(t => t["Status"] !== "Resolved" && t["Status"] !== "Closed");
    }
    
    // Start Date Filter
    if (state.dashFilters.startDate) {
        const filterStart = new Date(state.dashFilters.startDate);
        filterStart.setHours(0,0,0,0);
        list = list.filter(t => {
            const ticketDate = parseSheetDateToDate(t["Start Time"]);
            return ticketDate && ticketDate >= filterStart;
        });
    }
    
    // End Date Filter
    if (state.dashFilters.endDate) {
        const filterEnd = new Date(state.dashFilters.endDate);
        filterEnd.setHours(23,59,59,999);
        list = list.filter(t => {
            const ticketDate = parseSheetDateToDate(t["Start Time"]);
            return ticketDate && ticketDate <= filterEnd;
        });
    }
    
    // Activity Type Filter
    if (state.dashFilters.activity) {
        list = list.filter(t => t["Activity Type"] === state.dashFilters.activity);
    }
    
    // Vendor / Customer Filter
    if (state.dashFilters.vendor) {
        list = list.filter(t => t["Vendor"] === state.dashFilters.vendor);
    }
    
    // Category / Service Type Filter
    if (state.dashFilters.category) {
        list = list.filter(t => t["Infra Category"] === state.dashFilters.category);
    }
    
    return list;
}

function renderTicketsTable(ticketsToRender) {
    elements.ticketsTableList.innerHTML = '';
    const isCorp = state.activeTab === 'corporate';
    
    if (ticketsToRender.length === 0) {
        const colSpanCount = isCorp ? 8 : 7;
        elements.ticketsTableList.innerHTML = `
            <tr class="empty-row">
                <td colspan="${colSpanCount}" class="text-center">
                    <div class="empty-state">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>Tidak ada tiket ditemukan yang sesuai filter.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const sorted = [...ticketsToRender].sort((a, b) => {
        const idA = parseInt((a["Ticket ID"] || "").replace(/(INFRA-|CORP-)/, ""), 10) || 0;
        const idB = parseInt((b["Ticket ID"] || "").replace(/(INFRA-|CORP-)/, ""), 10) || 0;
        return idB - idA;
    });

    sorted.forEach((ticket) => {
        const tr = document.createElement('tr');
        const statusClass = `badge-${(ticket["Status"] || 'Open').toLowerCase().replace(/\s+/g, '')}`;
        const severityClass = `badge-${(ticket["Severity"] || 'Low').toLowerCase()}`;
        const shortTitle = ticket["Title"] && ticket["Title"].length > 42 
            ? ticket["Title"].substring(0, 42) + '...' 
            : (ticket["Title"] || '-');

        if (isCorp) {
            tr.innerHTML = `
                <td class="text-mono font-weight-bold" style="color: var(--accent-secondary);">${ticket["Ticket ID"]}</td>
                <td style="font-weight: 600; color: var(--text-primary);">${ticket["Customer Name"] || ticket["Vendor"] || '-'}</td>
                <td class="text-mono">${ticket["Service ID"] || ticket["Link / Device"] || '-'}</td>
                <td>${ticket["Site Name"] || ticket["Site / POP"] || '-'}</td>
                <td><span class="badge ${severityClass}">${ticket["Severity"]}</span></td>
                <td><span class="badge ${statusClass}">${ticket["Status"]}</span></td>
                <td class="text-mono" style="font-size: 12px;">${getCleanDuration(ticket)}</td>
                <td>
                    <div class="action-buttons" onclick="event.stopPropagation();">
                        <button class="btn btn-icon-only btn-edit" title="Detail Tiket" onclick="openDetailDrawer('${ticket["Ticket ID"]}')">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn btn-icon-only btn-delete" title="Hapus Tiket" onclick="deleteTicket('${ticket["Ticket ID"]}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
        } else {
            tr.innerHTML = `
                <td class="text-mono font-weight-bold" style="color: var(--accent-secondary);">${ticket["Ticket ID"]}</td>
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${shortTitle}</div>
                </td>
                <td>${ticket["Site / POP"] || '-'}</td>
                <td><span class="badge ${severityClass}">${ticket["Severity"]}</span></td>
                <td><span class="badge ${statusClass}">${ticket["Status"]}</span></td>
                <td class="text-mono" style="font-size: 12px;">${getCleanDuration(ticket)}</td>
                <td>
                    <div class="action-buttons" onclick="event.stopPropagation();">
                        <button class="btn btn-icon-only btn-edit" title="Detail Tiket" onclick="openDetailDrawer('${ticket["Ticket ID"]}')">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn btn-icon-only btn-delete" title="Hapus Tiket" onclick="deleteTicket('${ticket["Ticket ID"]}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
        }
        
        tr.addEventListener('click', () => { openDetailDrawer(ticket["Ticket ID"]); });
        elements.ticketsTableList.appendChild(tr);
    });
}

function updateStats(ticketsData) {
    // Scorecards are removed from UI
}

elements.tableSearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = filterDataset(state.tickets).filter(ticket => 
        (ticket["Ticket ID"] && ticket["Ticket ID"].toLowerCase().includes(q)) ||
        (ticket["Site / POP"] && ticket["Site / POP"].toLowerCase().includes(q)) ||
        (ticket["Title"] && ticket["Title"].toLowerCase().includes(q)) ||
        (ticket["Status"] && ticket["Status"].toLowerCase().includes(q)) ||
        (ticket["Severity"] && ticket["Severity"].toLowerCase().includes(q))
    );
    renderTicketsTable(filtered);
});

window.deleteTicket = async function(ticketId) {
    if (!confirm(`Apakah Anda yakin ingin menghapus Tiket ${ticketId}?`)) return;
    showToast(`Menghapus tiket ${ticketId}...`, "info");
    const dbKey = state.activeTab === 'infra' ? 'nexus_mock_tickets' : 'nexus_corporate_tickets';
    if (state.isMockMode) {
        const data = JSON.parse(localStorage.getItem(dbKey)) || [];
        const index = data.findIndex(t => t["Ticket ID"] === ticketId);
        if (index > -1) {
            data.splice(index, 1);
            localStorage.setItem(dbKey, JSON.stringify(data));
            showToast(`Tiket ${ticketId} berhasil dihapus (Luring)`, "success");
            loadTickets();
        }
    } else {
        try {
            const sheetParam = state.activeTab === 'infra' ? 'Tickets' : 'Corporate';
            await fetch(state.webAppUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: "delete", ticketId: ticketId, sheet: sheetParam })
            });
            showToast(`Tiket ${ticketId} dihapus. Menyinkronkan...`, "success");
            setTimeout(loadTickets, 1000);
        } catch (error) {
            showToast("Gagal menghapus tiket", "error");
        }
    }
};

// ==========================================
// 10. AUTO DURATION & SLA CALCULATION
// ==========================================
function formatMinutesToDuration(totalMinutes) {
    if (totalMinutes < 0 || isNaN(totalMinutes)) return "00 Jam : 00 Menit";
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${String(hours).padStart(2, '0')} Jam : ${String(mins).padStart(2, '0')} Menit`;
}

function parseDurationToMinutes(durationStr) {
    if (!durationStr) return 0;
    if (typeof durationStr !== 'string') durationStr = String(durationStr);
    
    // Format "01 Jam : 30 Menit"
    const match = durationStr.match(/(\d+)\s*Jam\s*:\s*(\d+)\s*Menit/i);
    if (match) {
        return (parseInt(match[1], 10) * 60) + parseInt(match[2], 10);
    }
    // Format "HH:MM:SS" atau "HH:MM"
    const timeMatch = durationStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
        return (parseInt(timeMatch[1], 10) * 60) + parseInt(timeMatch[2], 10);
    }
    const num = parseInt(durationStr, 10);
    return isNaN(num) ? 0 : num;
}

function calculateDurations() {
    const startVal = elements.inputStartTime.value;
    const endVal = elements.inputEndTime.value;
    const holdVal = elements.inputOnHold.value.trim();
    if (!startVal) {
        elements.inputActualDuration.value = '';
        elements.inputSlaDuration.value = '';
        return;
    }
    const startDate = new Date(startVal);
    if (!endVal) {
        elements.inputActualDuration.value = 'Dalam Proses';
        elements.inputSlaDuration.value = 'Dalam Proses';
        return;
    }
    const endDate = new Date(endVal);
    const diffMs = endDate - startDate;
    if (diffMs < 0) {
        elements.inputActualDuration.value = 'Waktu Selesai Tidak Valid';
        elements.inputSlaDuration.value = 'Waktu Selesai Tidak Valid';
        return;
    }
    const totalMinutes = Math.floor(diffMs / 1000 / 60);
    elements.inputActualDuration.value = formatMinutesToDuration(totalMinutes);
    const holdMinutes = parseDurationToMinutes(holdVal);
    const slaMinutes = Math.max(0, totalMinutes - holdMinutes);
    elements.inputSlaDuration.value = formatMinutesToDuration(slaMinutes);
}

elements.inputStartTime.addEventListener('change', calculateDurations);
elements.inputEndTime.addEventListener('change', calculateDurations);
elements.inputOnHold.addEventListener('input', calculateDurations);

// ==========================================
// 11. SLA TAB LOGIC (FILTERS, DATA LOAD, CSV)
// ==========================================
function normalizeTicketData(ticket) {
    if (!ticket) return ticket;
    
    // 1. Ticket ID / ticket
    if (ticket["ticket"] !== undefined && ticket["Ticket ID"] === undefined) {
        ticket["Ticket ID"] = ticket["ticket"];
    }
    // 2. THC Ticket / thc
    if (ticket["thc"] !== undefined && ticket["THC Ticket"] === undefined) {
        ticket["THC Ticket"] = ticket["thc"];
    }
    // 3. Severity / saverity
    if (ticket["saverity"] !== undefined && ticket["Severity"] === undefined) {
        ticket["Severity"] = ticket["saverity"];
    }
    // 4. Vendor / customer name / Customer Name
    const customerVal = ticket["customer name"] || ticket["Customer Name"] || ticket["customer_name"];
    if (customerVal !== undefined) {
        ticket["Customer Name"] = customerVal;
        if (ticket["Vendor"] === undefined) {
            ticket["Vendor"] = customerVal;
        }
    }
    // 5. Site / POP / site name / Site Name
    const siteVal = ticket["site name"] || ticket["Site Name"] || ticket["site_name"];
    if (siteVal !== undefined) {
        ticket["Site Name"] = siteVal;
        if (ticket["Site / POP"] === undefined) {
            ticket["Site / POP"] = siteVal;
        }
    }
    // 6. Link / Device / service id / Service ID
    const serviceVal = ticket["service id"] || ticket["Service ID"] || ticket["service_id"];
    if (serviceVal !== undefined) {
        ticket["Service ID"] = serviceVal;
        if (ticket["Link / Device"] === undefined) {
            ticket["Link / Device"] = serviceVal;
        }
    }
    // 7. Infra Category / service type / Service Type
    const typeVal = ticket["service type"] || ticket["Service Type"] || ticket["service_type"];
    if (typeVal !== undefined) {
        ticket["Service Type"] = typeVal;
        if (ticket["Infra Category"] === undefined) {
            ticket["Infra Category"] = typeVal;
        }
    }
    // 8. SLA Duration / sla duration (minute) / SLA Duration (Minute)
    const slaVal = ticket["sla duration (minute)"] || ticket["SLA Duration (Minute)"] || ticket["sla duration"] || ticket["SLA Duration"];
    if (slaVal !== undefined && ticket["SLA Duration"] === undefined) {
        ticket["SLA Duration"] = slaVal;
    }
    // 9. Root Cause Detail / rootcause detail / Rootcause Detail
    const rcVal = ticket["rootcause detail"] || ticket["Rootcause Detail"] || ticket["root cause detail"];
    if (rcVal !== undefined && ticket["Root Cause Detail"] === undefined) {
        ticket["Root Cause Detail"] = rcVal;
    }
    
    return ticket;
}

function formatDateTimeString(str) {
    if (!str) return '-';
    if (typeof str !== 'string') str = String(str);
    
    // YYYY-MM-DD HH:MM atau YYYY-MM-DD HH:MM:SS
    const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (ymdMatch) {
        return `${ymdMatch[3]}/${ymdMatch[2]}/${ymdMatch[1]} ${ymdMatch[4]}:${ymdMatch[5]}`;
    }
    
    // Jika format ISO: 2026-08-14T06:47:00.000Z
    if (str.includes('T')) {
        try {
            // Coba parser tekstual agar bebas pergeseran timezone jika string berakhiran Z
            const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
            if (isoMatch) {
                return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]} ${isoMatch[4]}:${isoMatch[5]}`;
            }
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                const hour = String(d.getHours()).padStart(2, '0');
                const minute = String(d.getMinutes()).padStart(2, '0');
                return `${day}/${month}/${year} ${hour}:${minute}`;
            }
        } catch (e) {}
    }
    return str;
}

function formatDurationString(str) {
    if (!str) return '-';
    if (typeof str !== 'string') str = String(str);
    
    // Jika format ISO tanggal 1899/1900 dari Apps Script (contoh: 1899-12-29T16:53:48.000Z)
    if (str.startsWith('1899-') || str.startsWith('1900-') || str.includes('T')) {
        try {
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                const hours = d.getUTCHours();
                const minutes = d.getUTCMinutes();
                return `${String(hours).padStart(2, '0')} Jam : ${String(minutes).padStart(2, '0')} Menit`;
            }
        } catch (e) {}
    }
    
    // Jika format HH:MM:SS atau HH:MM
    const timeMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        return `${String(hours).padStart(2, '0')} Jam : ${String(minutes).padStart(2, '0')} Menit`;
    }
    
    return str;
}

function parseSheetDateToDate(dateStr) {
    if (!dateStr) return null;
    try {
        if (typeof dateStr === 'string') {
            const cleaned = dateStr.replace(/\s*\/\s*/g, '/').replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
            // Cek format YYYY-MM-DD HH:MM
            if (cleaned.includes('-') && cleaned.includes(' ')) {
                const parts = cleaned.split(' ');
                const dateParts = parts[0].split('-'); // Y-M-D
                const timeParts = parts[1].split(':'); // H:M
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);
                const hour = parseInt(timeParts[0], 10);
                const minute = parseInt(timeParts[1], 10);
                return new Date(year, month, day, hour, minute);
            }
            // Cek format D/M/Y HH:MM
            if (cleaned.includes('/')) {
                const parts = cleaned.split(' ');
                const dateParts = parts[0].split('/'); // D/M/Y
                const timeParts = (parts[1] || '00:00').split(':'); // H:M
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const year = parseInt(dateParts[2], 10);
                const hour = parseInt(timeParts[0] || 0, 10);
                const minute = parseInt(timeParts[1] || 0, 10);
                return new Date(year, month, day, hour, minute);
            }
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    } catch (e) {
        return null;
    }
}

function getCleanDuration(ticket) {
    if (!ticket) return '-';
    const startTimeStr = ticket["Start Time"];
    const endTimeStr = ticket["End Time"];
    
    if (!startTimeStr) return formatDurationString(ticket["Actual Duration"]);
    
    const startDate = parseSheetDateToDate(startTimeStr);
    if (!startDate) return formatDurationString(ticket["Actual Duration"]);
    
    if (!endTimeStr || endTimeStr.trim().toLowerCase() === 'dalam proses' || endTimeStr.trim() === '') {
        return 'Dalam Proses';
    }
    
    const endDate = parseSheetDateToDate(endTimeStr);
    if (!endDate) return formatDurationString(ticket["Actual Duration"]);
    
    const diffMs = endDate - startDate;
    if (diffMs < 0) return 'Waktu Selesai Tidak Valid';
    
    const totalMinutes = Math.floor(diffMs / 1000 / 60);
    return formatMinutesToDuration(totalMinutes);
}

function getCleanSlaDuration(ticket) {
    if (!ticket) return '-';
    const startTimeStr = ticket["Start Time"];
    const endTimeStr = ticket["End Time"];
    const holdStr = ticket["On Hold Duration"];
    
    if (!startTimeStr) return formatDurationString(ticket["SLA Duration"]);
    
    const startDate = parseSheetDateToDate(startTimeStr);
    if (!startDate) return formatDurationString(ticket["SLA Duration"]);
    
    if (!endTimeStr || endTimeStr.trim().toLowerCase() === 'dalam proses' || endTimeStr.trim() === '') {
        return 'Dalam Proses';
    }
    
    const endDate = parseSheetDateToDate(endTimeStr);
    if (!endDate) return formatDurationString(ticket["SLA Duration"]);
    
    const diffMs = endDate - startDate;
    if (diffMs < 0) return 'Waktu Selesai Tidak Valid';
    
    const totalMinutes = Math.floor(diffMs / 1000 / 60);
    const holdMinutes = parseDurationToMinutes(holdStr);
    const slaMinutes = Math.max(0, totalMinutes - holdMinutes);
    return formatMinutesToDuration(slaMinutes);
}

async function loadSlaReport() {
    const cachedData = JSON.parse(localStorage.getItem('nexus_corporate_tickets')) || [];
    const hasCache = cachedData.length > 0;

    if (!hasCache) {
        elements.slaTicketsList.innerHTML = `
            <tr>
                <td colspan="11" class="text-center">
                    <div class="empty-state">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <p>Mengambil data SLA...</p>
                    </div>
                </td>
            </tr>
        `;
    }

    const processSlaData = (rawData) => {
        const cleaned = (rawData || []).filter(Boolean).map(normalizeTicketData);
        
        if (elements.filterCustomerName.options.length <= 1) {
            populateCustomerDropdowns();
        }

        let filtered = [...cleaned];
        if (state.slaFilters.customer) {
            filtered = filtered.filter(t => t && (t["Customer Name"] === state.slaFilters.customer || t["Vendor"] === state.slaFilters.customer));
        }
        if (state.slaFilters.startDate) {
            const filterStart = new Date(state.slaFilters.startDate);
            filterStart.setHours(0,0,0,0);
            filtered = filtered.filter(t => {
                if (!t) return false;
                const ticketDate = parseSheetDateToDate(t["Start Time"]);
                return ticketDate && ticketDate >= filterStart;
            });
        }
        if (state.slaFilters.endDate) {
            const filterEnd = new Date(state.slaFilters.endDate);
            filterEnd.setHours(23,59,59,999);
            filtered = filtered.filter(t => {
                if (!t) return false;
                const ticketDate = parseSheetDateToDate(t["Start Time"]);
                return ticketDate && ticketDate <= filterEnd;
            });
        }
        renderSlaTable(filtered);
    };

    // 1. Tampilkan dari cache secara instan
    if (hasCache) {
        processSlaData(cachedData);
    }

    // 2. Hubungkan online di latar belakang
    if (!state.isMockMode && state.webAppUrl) {
        try {
            const response = await fetch(`${state.webAppUrl}?action=readAll&sheet=Corporate&_t=${Date.now()}`);
            if (response.ok) {
                const result = await response.json();
                if (result && result.status === "success") {
                    localStorage.setItem('nexus_corporate_tickets', JSON.stringify(result.data));
                    processSlaData(result.data);
                }
            }
        } catch (error) {
            console.error("SLA background sync failed:", error);
            if (!hasCache) {
                elements.slaTicketsList.innerHTML = `
                    <tr>
                        <td colspan="11" class="text-center text-danger">
                            <div class="empty-state">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <p>Gagal memuat data SLA: ${error.message}</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    } else if (state.isMockMode && !hasCache) {
        processSlaData([]);
    }
}

function renderSlaTable(list) {
    elements.slaTicketsList.innerHTML = '';
    
    if (list.length === 0) {
        elements.slaTicketsList.innerHTML = `
            <tr class="empty-row">
                <td colspan="11" class="text-center">
                    <div class="empty-state">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>Tidak ada tiket Corporate SLA ditemukan yang sesuai filter.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(ticket => {
        const tr = document.createElement('tr');
        const severityClass = `badge-${(ticket["Severity"] || 'Low').toLowerCase()}`;
        const slaDurationStr = getCleanSlaDuration(ticket);
        const slaMinutes = parseDurationToMinutes(slaDurationStr);
        
        tr.innerHTML = `
            <td style="font-weight:600; color: var(--text-primary);">${ticket["Customer Name"] || ticket["Vendor"] || '-'}</td>
            <td><span class="badge ${severityClass}">${ticket["Severity"]}</span></td>
            <td class="text-mono" style="font-size:12px;">${ticket["THC Ticket"] || '-'}</td>
            <td class="text-mono font-weight-bold" style="color: var(--accent-secondary);">${ticket["Ticket ID"]}</td>
            <td class="text-mono">${ticket["Service ID"] || ticket["Link / Device"] || '-'}</td>
            <td>${ticket["Site Name"] || ticket["Site / POP"] || '-'}</td>
            <td>${ticket["Service Type"] || ticket["Infra Category"] || '-'}</td>
            <td class="text-mono" style="font-size:12px;">${formatDateTimeString(ticket["Start Time"])}</td>
            <td class="text-mono" style="font-size:12px;">${formatDateTimeString(ticket["End Time"])}</td>
            <td class="text-mono text-center" style="font-weight:700; color: var(--accent-secondary);">${slaMinutes} Min</td>
            <td style="font-size:12px; color: var(--text-secondary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ticket["Root Cause Detail"] || ''}">
                ${ticket["Root Cause Detail"] || '-'}
            </td>
        `;
        
        tr.addEventListener('click', () => { openDetailDrawer(ticket["Ticket ID"]); });
        elements.slaTicketsList.appendChild(tr);
    });
}

elements.btnApplySla.addEventListener('click', () => {
    state.slaFilters.customer = elements.filterCustomerName.value;
    state.slaFilters.startDate = elements.filterStartDate.value;
    state.slaFilters.endDate = elements.filterEndDate.value;
    showToast("Filter SLA diterapkan.", "success");
    loadSlaReport();
});

elements.btnResetSla.addEventListener('click', () => {
    elements.filterCustomerName.value = '';
    elements.filterStartDate.value = '';
    elements.filterEndDate.value = '';
    state.slaFilters.customer = '';
    state.slaFilters.startDate = '';
    state.slaFilters.endDate = '';
    showToast("Filter SLA dikosongkan.", "info");
    loadSlaReport();
});

elements.btnExportSlaCsv.addEventListener('click', () => {
    let filtered = [...state.tickets];
    if (state.slaFilters.customer) filtered = filtered.filter(t => t["Vendor"] === state.slaFilters.customer);
    if (state.slaFilters.startDate) {
        const filterStart = new Date(state.slaFilters.startDate);
        filterStart.setHours(0,0,0,0);
        filtered = filtered.filter(t => {
            const ticketDate = parseSheetDateToDate(t["Start Time"]);
            return ticketDate && ticketDate >= filterStart;
        });
    }
    if (state.slaFilters.endDate) {
        const filterEnd = new Date(state.slaFilters.endDate);
        filterEnd.setHours(23,59,59,999);
        filtered = filtered.filter(t => {
            const ticketDate = parseSheetDateToDate(t["Start Time"]);
            return ticketDate && ticketDate <= filterEnd;
        });
    }

    if (filtered.length === 0) {
        showToast("Tidak ada data untuk diekspor!", "error");
        return;
    }

    const csvRows = [
        "Customer Name,Severity,THC Ticket,Ticket ID,Service ID,Site Name,Service Type,Start Time,End Time,SLA Duration (Minutes),Root Cause Detail"
    ];

    filtered.forEach(item => {
        const cleanRootCause = (item["Root Cause Detail"] || "")
            .replace(/"/g, '""')
            .replace(/\n/g, ' ')
            .replace(/\r/g, '');

        const row = [
            `"${item["Vendor"] || ""}"`,
            `"${item["Severity"] || ""}"`,
            `"${item["THC Ticket"] || ""}"`,
            `"${item["Ticket ID"] || ""}"`,
            `"${item["Link / Device"] || ""}"`,
            `"${item["Site / POP"] || ""}"`,
            `"${item["Infra Category"] || ""}"`,
            `"${item["Start Time"] || ""}"`,
            `"${item["End Time"] || ""}"`,
            `"${parseDurationToMinutes(item["SLA Duration"])}"`,
            `"${cleanRootCause}"`
        ];
        csvRows.push(row.join(","));
    });

    const csvFile = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const downloadLink = document.createElement("a");
    const today = new Date().toISOString().split('T')[0];
    
    downloadLink.download = `SLA_Report_Corporate_${today}.csv`;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast("Laporan SLA berhasil diekspor!", "success");
});

// ==========================================
// 12. FORM UTILS (POPULATE, VALIDATE, SUBMIT)
// ==========================================
function populateForm(ticketId) {
    const ticket = state.tickets.find(t => t["Ticket ID"] === ticketId);
    if (!ticket) return;
    
    elements.inputTicketId.value = ticket["Ticket ID"] || '';
    elements.inputTicketId.readOnly = true;
    
    document.getElementById('input-thc-ticket').value = ticket["THC Ticket"] || '';
    document.getElementById('input-vendor-ticket').value = ticket["Vendor Ticket"] || '';
    document.getElementById('input-activity-type').value = ticket["Activity Type"] || '';
    document.getElementById('input-severity').value = ticket["Severity"] || '';
    document.getElementById('input-status').value = ticket["Status"] || '';
    
    if (state.activeTab === 'corporate') {
        if (elements.inputCustomerNameField) elements.inputCustomerNameField.value = ticket["Customer Name"] || '';
        document.getElementById('input-vendor').value = ticket["Vendor"] || '';
        document.getElementById('input-site-pop').value = ticket["Site Name"] || '';
        document.getElementById('input-link-device').value = ticket["Service ID"] || '';
        document.getElementById('input-infra-category').value = ticket["Service Type"] || '';
    } else {
        if (elements.inputCustomerNameField) elements.inputCustomerNameField.value = '';
        document.getElementById('input-vendor').value = ticket["Vendor"] || '';
        document.getElementById('input-site-pop').value = ticket["Site / POP"] || '';
        document.getElementById('input-link-device').value = ticket["Link / Device"] || '';
        document.getElementById('input-infra-category').value = ticket["Infra Category"] || '';
    }
    document.getElementById('input-title').value = ticket["Title"] || '';
    
    const formatToInputDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            if (typeof dateStr === 'string') {
                if (dateStr.includes('-') && dateStr.includes(' ')) {
                    return dateStr.replace(' ', 'T').substring(0, 16);
                }
                if (dateStr.includes('/')) {
                    const parts = dateStr.split(' ');
                    const dateParts = parts[0].split('/');
                    const timeParts = parts[1].split(':');
                    const day = dateParts[0].padStart(2, '0');
                    const month = dateParts[1].padStart(2, '0');
                    const year = dateParts[2];
                    const hour = timeParts[0].padStart(2, '0');
                    const minute = timeParts[1].padStart(2, '0');
                    return `${year}-${month}-${day}T${hour}:${minute}`;
                }
            }
            const d = new Date(dateStr);
            if (isNaN(d)) return '';
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hour = String(d.getHours()).padStart(2, '0');
            const minute = String(d.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hour}:${minute}`;
        } catch (e) { return ''; }
    };

    elements.inputStartTime.value = formatToInputDate(ticket["Start Time"]);
    elements.inputEndTime.value = formatToInputDate(ticket["End Time"]);
    elements.inputOnHold.value = ticket["On Hold Duration"] || '';
    elements.inputActualDuration.value = ticket["Actual Duration"] || '';
    elements.inputSlaDuration.value = ticket["SLA Duration"] || '';
    
    document.getElementById('input-root-cause-l1').value = ticket["Root Cause L1"] || '';
    document.getElementById('input-root-cause-l2').value = ticket["Root Cause L2"] || '';
    document.getElementById('input-root-cause-detail').value = ticket["Root Cause Detail"] || '';
    document.getElementById('input-action').value = ticket["Action"] || '';
    
    document.getElementById('input-created-by').value = ticket["Created By"] || '';
    document.getElementById('input-closed-by').value = ticket["Closed By"] || '';
    document.getElementById('input-timeline-docs').value = ticket["Timeline Docs"] || '';
}

function validateForm() {
    let isValid = true;
    const requiredInputs = elements.ticketForm.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        const formControl = input.closest('.form-control');
        if (!input.value || input.value.trim() === '') {
            formControl.classList.add('invalid');
            isValid = false;
        } else {
            formControl.classList.remove('invalid');
        }
    });
    return isValid;
}

function resetForm() {
    elements.ticketForm.reset();
    elements.inputTicketId.readOnly = false;
    const formControls = elements.ticketForm.querySelectorAll('.form-control');
    formControls.forEach(ctrl => ctrl.classList.remove('invalid'));
}

elements.ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        showToast("Mohon isi kolom bertanda bintang (*)", "error");
        return;
    }

    const formatToSheetDate = (isoStr) => {
        if (!isoStr) return '';
        // Beralih ke penyimpanan string timezone-agnostik murni: "YYYY-MM-DD HH:MM"
        return isoStr.replace('T', ' ');
    };

    const formData = new FormData(elements.ticketForm);
    const ticketData = {};
    formData.forEach((value, key) => {
        ticketData[key] = value;
    });

    ticketData["Start Time"] = formatToSheetDate(ticketData["Start Time"]);
    if (ticketData["End Time"]) {
        ticketData["End Time"] = formatToSheetDate(ticketData["End Time"]);
    }

    ticketData["Actual Duration"] = elements.inputActualDuration.value;
    ticketData["SLA Duration"] = elements.inputSlaDuration.value;

    // Duplikasi key untuk mendukung variasi kolom di Google Sheets (Corporate / Custom)
    ticketData["ticket"] = ticketData["Ticket ID"];
    ticketData["thc"] = ticketData["THC Ticket"];
    ticketData["saverity"] = ticketData["Severity"];
    ticketData["sla duration (minute)"] = ticketData["SLA Duration"];
    ticketData["SLA Duration (Minute)"] = ticketData["SLA Duration"];
    ticketData["rootcause detail"] = ticketData["Root Cause Detail"];
    ticketData["Rootcause Detail"] = ticketData["Root Cause Detail"];

    if (state.activeTab === 'corporate') {
        ticketData["Customer Name"] = ticketData["Customer Name"] || "";
        ticketData["customer name"] = ticketData["Customer Name"];
        ticketData["Vendor"] = ticketData["Vendor"] || "";
        
        ticketData["Site Name"] = ticketData["Site / POP"] || "";
        ticketData["site name"] = ticketData["Site Name"];
        
        ticketData["Service ID"] = ticketData["Link / Device"] || "";
        ticketData["service id"] = ticketData["Service ID"];
        
        ticketData["Service Type"] = ticketData["Infra Category"] || "";
        ticketData["service type"] = ticketData["Service Type"];
    } else {
        ticketData["Vendor"] = ticketData["Vendor"] || "";
        ticketData["Customer Name"] = "";
        ticketData["customer name"] = "";
        
        ticketData["Site Name"] = ticketData["Site / POP"] || "";
        ticketData["site name"] = ticketData["Site / POP"] || "";
        
        ticketData["Service ID"] = ticketData["Link / Device"] || "";
        ticketData["service id"] = ticketData["Link / Device"] || "";
        
        ticketData["Service Type"] = ticketData["Infra Category"] || "";
        ticketData["service type"] = ticketData["Infra Category"] || "";
    }

    const dbKey = state.activeTab === 'infra' ? 'nexus_mock_tickets' : 'nexus_corporate_tickets';
    const submitBtn = elements.ticketForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    showToast("Menyimpan tiket...", "info");

    if (state.isMockMode) {
        const data = JSON.parse(localStorage.getItem(dbKey)) || [];
        
        if (state.currentEditId) {
            const index = data.findIndex(t => t["Ticket ID"] === state.currentEditId);
            if (index > -1) {
                data[index] = ticketData;
                showToast("Tiket berhasil di-update", "success");
            }
        } else {
            const exists = data.some(t => t["Ticket ID"] === ticketData["Ticket ID"]);
            if (exists) {
                showToast("Ticket ID sudah terdaftar! Gunakan ID lain.", "error");
                submitBtn.disabled = false;
                return;
            }
            data.push(ticketData);
            showToast("Tiket baru berhasil disimpan", "success");
        }
        
        localStorage.setItem(dbKey, JSON.stringify(data));
        submitBtn.disabled = false;
        
        openDetailDrawer(ticketData["Ticket ID"]);
        loadTickets();
    } else {
        try {
            const sheetParam = state.activeTab === 'infra' ? 'Tickets' : 'Corporate';
            const payload = {
                action: state.currentEditId ? "update" : "create",
                ticketId: state.currentEditId || ticketData["Ticket ID"],
                sheet: sheetParam,
                data: ticketData
            };

            await fetch(state.webAppUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });

            showToast("Berhasil menyimpan data ke Sheets!", "success");
            setTimeout(() => {
                submitBtn.disabled = false;
                openDetailDrawer(ticketData["Ticket ID"]);
                loadTickets();
            }, 1000);
        } catch (error) {
            showToast("Gagal menyimpan ke Google Sheets", "error");
            submitBtn.disabled = false;
        }
    }
});

// ==========================================
// 13. NOC DASHBOARD DATA AGGREGATION
// ==========================================
async function loadNocDashboard() {
    let infraTickets = [];
    let corpTickets = [];
    
    // Tampilkan data cache lokal secara instan terlebih dahulu (0 ms delay)
    try {
        infraTickets = (JSON.parse(localStorage.getItem('nexus_mock_tickets')) || []).map(normalizeTicketData);
        corpTickets = (JSON.parse(localStorage.getItem('nexus_corporate_tickets')) || []).map(normalizeTicketData);
        if (infraTickets.length > 0 || corpTickets.length > 0) {
            renderNocDashboardUI(infraTickets, corpTickets);
        } else {
            document.getElementById('noc-active-infra-list').innerHTML = '<div class="text-center" style="color: var(--text-muted); padding: 40px 12px;"><i class="fa-solid fa-spinner fa-spin"></i> Mengambil data tiket aktif...</div>';
            document.getElementById('noc-active-corp-list').innerHTML = '<div class="text-center" style="color: var(--text-muted); padding: 40px 12px;"><i class="fa-solid fa-spinner fa-spin"></i> Mengambil data tiket aktif...</div>';
        }
    } catch (e) {
        console.warn("Gagal membaca cache NOC Dashboard:", e);
    }
    
    if (state.isMockMode) {
        if (infraTickets.length === 0) {
            await seedDatabaseFromCSV();
            infraTickets = (JSON.parse(localStorage.getItem('nexus_mock_tickets')) || []).map(normalizeTicketData);
        }
        corpTickets = (JSON.parse(localStorage.getItem('nexus_corporate_tickets')) || []).map(normalizeTicketData);
        renderNocDashboardUI(infraTickets, corpTickets);
    } else {
        // Lakukan sinkronisasi data online di latar belakang
        try {
            const resInfra = await fetch(`${state.webAppUrl}?action=readAll&sheet=Tickets`);
            if (resInfra.ok) {
                const result = await resInfra.json();
                if (result.status === "success") {
                    infraTickets = result.data.map(normalizeTicketData);
                    localStorage.setItem('nexus_mock_tickets', JSON.stringify(result.data));
                }
            }
            const resCorp = await fetch(`${state.webAppUrl}?action=readAll&sheet=Corporate`);
            if (resCorp.ok) {
                const result = await resCorp.json();
                if (result.status === "success") {
                    corpTickets = result.data.map(normalizeTicketData);
                    localStorage.setItem('nexus_corporate_tickets', JSON.stringify(result.data));
                }
            }
            renderNocDashboardUI(infraTickets, corpTickets);
        } catch (e) {
            console.error("Gagal sinkronisasi NOC Dashboard online:", e);
            // Tetap gunakan data cache lokal yang sudah ditampilkan
        }
    }
}

function renderNocDashboardUI(infraTickets, corpTickets) {
    // --- 1. PROCESS INFRA TICKETS ---
    let infraOpen = 0;
    let infraProgress = 0;
    let infraOnHold = 0;
    
    let infraCrit = 0;
    let infraMaj = 0;
    let infraMin = 0;
    let infraLow = 0;
    const activeInfraList = [];
    
    infraTickets.forEach(ticket => {
        const status = (ticket["Status"] || '').trim().toLowerCase();
        if (status === 'open') infraOpen++;
        else if (status === 'progress' || status === 'in progress') infraProgress++;
        else if (status === 'on hold') infraOnHold++;
        
        // Process active tickets only
        if (status !== 'resolved' && status !== 'closed' && ticket["Ticket ID"]) {
            activeInfraList.push(ticket);
            
            // Count active severity
            const sev = (ticket["Severity"] || '').trim().toLowerCase();
            if (sev === 'critical') infraCrit++;
            else if (sev === 'major') infraMaj++;
            else if (sev === 'minor') infraMin++;
            else infraLow++;
        }
    });
    
    const activeInfraCount = infraOpen + infraProgress + infraOnHold;
    
    // Update scorecards text
    document.getElementById('noc-infra-open').textContent = infraOpen;
    document.getElementById('noc-infra-progress').textContent = infraProgress;
    document.getElementById('noc-infra-onhold').textContent = infraOnHold;
    document.getElementById('noc-infra-active-count').textContent = activeInfraCount;
    
    // Update SVG Radial Gauge Fill
    const infraTotal = infraTickets.length;
    const infraPercentResolved = infraTotal > 0 ? ((infraTotal - activeInfraCount) / infraTotal) * 100 : 100;
    const infraOffset = 264 - (264 * infraPercentResolved / 100);
    const infraGaugeFill = document.getElementById('noc-infra-gauge-fill');
    if (infraGaugeFill) {
        infraGaugeFill.style.strokeDashoffset = infraOffset;
        infraGaugeFill.style.stroke = activeInfraCount === 0 ? 'var(--accent-success)' : 'var(--accent-primary)';
    }
    
    // Update Severity distribution bar
    document.getElementById('noc-infra-severity-text').textContent = `${infraCrit} Crit / ${infraMaj} Maj`;
    if (activeInfraCount > 0) {
        document.getElementById('noc-infra-seg-crit').style.width = `${(infraCrit / activeInfraCount) * 100}%`;
        document.getElementById('noc-infra-seg-maj').style.width = `${(infraMaj / activeInfraCount) * 100}%`;
        document.getElementById('noc-infra-seg-min').style.width = `${(infraMin / activeInfraCount) * 100}%`;
        document.getElementById('noc-infra-seg-low').style.width = `${(infraLow / activeInfraCount) * 100}%`;
    } else {
        document.getElementById('noc-infra-seg-crit').style.width = '0%';
        document.getElementById('noc-infra-seg-maj').style.width = '0%';
        document.getElementById('noc-infra-seg-min').style.width = '0%';
        document.getElementById('noc-infra-seg-low').style.width = '0%';
    }
    
    // Render Active Incident stream list (sorted by ID descending)
    const activeInfraContainer = document.getElementById('noc-active-infra-list');
    activeInfraContainer.innerHTML = '';
    
    if (activeInfraList.length === 0) {
        activeInfraContainer.innerHTML = '<div style="color: var(--text-muted); padding: 40px 12px; text-align: center;">Tidak ada tiket aktif</div>';
    } else {
        activeInfraList.sort((a,b) => {
            const idA = parseInt((a["Ticket ID"] || '').replace('INFRA-', ''), 10) || 0;
            const idB = parseInt((b["Ticket ID"] || '').replace('INFRA-', ''), 10) || 0;
            return idB - idA;
        });
        activeInfraList.forEach(ticket => {
            const div = document.createElement('div');
            div.className = 'noc-list-item';
            div.style.cursor = 'pointer';
            
            let dotColor = '#3b82f6';
            const sev = (ticket["Severity"] || '').trim().toLowerCase();
            if (sev === 'critical') dotColor = '#ef4444';
            else if (sev === 'major') dotColor = '#f59e0b';
            else if (sev === 'minor') dotColor = '#eab308';
            
            div.innerHTML = `
                <span class="noc-pulse-dot" style="background-color: ${dotColor}; color: ${dotColor}; animation: pulse-glow 2s infinite ease-in-out;"></span>
                <span class="text-mono font-weight-bold" style="color: var(--accent-secondary); margin-right: 8px;">${ticket["Ticket ID"]}</span> - 
                <span style="font-weight: 600; margin: 0 4px;">${ticket["Activity Type"] || 'Incident'}</span> - 
                <span class="badge badge-${(ticket["Status"] || 'Open').toLowerCase().replace(/\s+/g, '')}" style="font-size: 10px; padding: 2px 6px; margin: 0 4px;">${ticket["Status"]}</span> - 
                <span style="color: var(--text-secondary); margin-left: 4px; font-size: 12px;">${ticket["Title"] || '-'}</span>
            `;
            
            div.addEventListener('click', () => {
                state.tickets = infraTickets;
                state.activeTab = 'infra';
                openDetailDrawer(ticket["Ticket ID"]);
            });
            activeInfraContainer.appendChild(div);
        });
    }
    
    // --- 2. PROCESS CORPORATE TICKETS ---
    let corpOpen = 0;
    let corpProgress = 0;
    let corpOnHold = 0;
    
    let corpCrit = 0;
    let corpMaj = 0;
    let corpMin = 0;
    let corpLow = 0;
    const activeCorpList = [];
    
    corpTickets.forEach(ticket => {
        const status = (ticket["Status"] || '').trim().toLowerCase();
        if (status === 'open') corpOpen++;
        else if (status === 'progress' || status === 'in progress') corpProgress++;
        else if (status === 'on hold') corpOnHold++;
        
        // Filter active tickets
        if (status !== 'resolved' && status !== 'closed' && ticket["Ticket ID"]) {
            activeCorpList.push(ticket);
            
            // Count severity
            const sev = (ticket["Severity"] || '').trim().toLowerCase();
            if (sev === 'critical') corpCrit++;
            else if (sev === 'major') corpMaj++;
            else if (sev === 'minor') corpMin++;
            else corpLow++;
        }
    });
    
    const activeCorpCount = corpOpen + corpProgress + corpOnHold;
    
    // Update scorecards text
    document.getElementById('noc-corp-open').textContent = corpOpen;
    document.getElementById('noc-corp-progress').textContent = corpProgress;
    document.getElementById('noc-corp-onhold').textContent = corpOnHold;
    document.getElementById('noc-corp-active-count').textContent = activeCorpCount;
    
    // Update SVG Radial Gauge Fill
    const corpTotal = corpTickets.length;
    const corpPercentResolved = corpTotal > 0 ? ((corpTotal - activeCorpCount) / corpTotal) * 100 : 100;
    const corpOffset = 264 - (264 * corpPercentResolved / 100);
    const corpGaugeFill = document.getElementById('noc-corp-gauge-fill');
    if (corpGaugeFill) {
        corpGaugeFill.style.strokeDashoffset = corpOffset;
        corpGaugeFill.style.stroke = activeCorpCount === 0 ? 'var(--accent-success)' : 'var(--accent-primary)';
    }
    
    // Update Severity distribution bar
    document.getElementById('noc-corp-severity-text').textContent = `${corpCrit} Crit / ${corpMaj} Maj`;
    if (activeCorpCount > 0) {
        document.getElementById('noc-corp-seg-crit').style.width = `${(corpCrit / activeCorpCount) * 100}%`;
        document.getElementById('noc-corp-seg-maj').style.width = `${(corpMaj / activeCorpCount) * 100}%`;
        document.getElementById('noc-corp-seg-min').style.width = `${(corpMin / activeCorpCount) * 100}%`;
        document.getElementById('noc-corp-seg-low').style.width = `${(corpLow / activeCorpCount) * 100}%`;
    } else {
        document.getElementById('noc-corp-seg-crit').style.width = '0%';
        document.getElementById('noc-corp-seg-maj').style.width = '0%';
        document.getElementById('noc-corp-seg-min').style.width = '0%';
        document.getElementById('noc-corp-seg-low').style.width = '0%';
    }
    
    // Render Active Incident stream list (sorted by ID descending)
    const activeCorpContainer = document.getElementById('noc-active-corp-list');
    activeCorpContainer.innerHTML = '';
    
    if (activeCorpList.length === 0) {
        activeCorpContainer.innerHTML = '<div style="color: var(--text-muted); padding: 40px 12px; text-align: center;">Tidak ada tiket aktif</div>';
    } else {
        activeCorpList.sort((a,b) => {
            const idA = parseInt((a["Ticket ID"] || '').replace('CORP-', ''), 10) || 0;
            const idB = parseInt((b["Ticket ID"] || '').replace('CORP-', ''), 10) || 0;
            return idB - idA;
        });
        activeCorpList.forEach(ticket => {
            const div = document.createElement('div');
            div.className = 'noc-list-item';
            div.style.cursor = 'pointer';
            
            let dotColor = '#3b82f6';
            const sev = (ticket["Severity"] || '').trim().toLowerCase();
            if (sev === 'critical') dotColor = '#ef4444';
            else if (sev === 'major') dotColor = '#f59e0b';
            else if (sev === 'minor') dotColor = '#eab308';
            
            div.innerHTML = `
                <span class="noc-pulse-dot" style="background-color: ${dotColor}; color: ${dotColor}; animation: pulse-glow 2s infinite ease-in-out;"></span>
                <span class="text-mono font-weight-bold" style="color: var(--accent-secondary); margin-right: 8px;">${ticket["Ticket ID"]}</span> - 
                <span style="font-weight: 600; margin: 0 4px;">${ticket["Activity Type"] || 'Incident'}</span> - 
                <span class="badge badge-${(ticket["Status"] || 'Open').toLowerCase().replace(/\s+/g, '')}" style="font-size: 10px; padding: 2px 6px; margin: 0 4px;">${ticket["Status"]}</span> - 
                <span style="color: var(--text-secondary); margin-left: 4px; font-size: 12px;">${ticket["Title"] || '-'}</span>
            `;
            
            div.addEventListener('click', () => {
                state.tickets = corpTickets;
                state.activeTab = 'corporate';
                openDetailDrawer(ticket["Ticket ID"]);
            });
            activeCorpContainer.appendChild(div);
        });
    }
    
    // --- 3. SET LAST UPDATE TIME ---
    const now = new Date();
    const formatNum = (n) => String(n).padStart(2, '0');
    const timeStr = `${formatNum(now.getDate())}/${formatNum(now.getMonth() + 1)}/${now.getFullYear()} ${formatNum(now.getHours())}:${formatNum(now.getMinutes())}:${formatNum(now.getSeconds())}`;
    document.getElementById('noc-last-update').textContent = `LAST UPDATE : ${timeStr}`;
}

// ==========================================
// 14. CUSTOMER DATABASE CRUD
// ==========================================
function closeCustomerDrawer() {
    elements.customerDrawer.classList.remove('open');
    elements.drawerOverlay.classList.add('d-none');
    elements.appContainer.classList.remove('drawer-active');
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 320);
}

function openCustomerDrawer(customerId = null) {
    state.currentEditId = customerId;
    elements.customerForm.reset();
    
    // Clear validation styling
    const formControls = elements.customerForm.querySelectorAll('.form-control');
    formControls.forEach(ctrl => ctrl.classList.remove('invalid'));

    if (customerId) {
        elements.customerDrawerTitle.textContent = `Edit Customer: ${customerId}`;
        elements.btnCustomerSubmitText.textContent = "Simpan Perubahan";
        
        // Populate fields
        const cust = state.customers.find(c => c["Customer ID"] === customerId);
        if (cust) {
            elements.inputCustomerId.value = cust["Customer ID"] || '';
            elements.inputCustomerName.value = cust["Customer Name"] || '';
            elements.inputCustomerSegment.value = cust["Segment"] && cust["Segment"] !== '-' ? cust["Segment"] : '';
            elements.inputCustomerPic.value = cust["PIC Name"] && cust["PIC Name"] !== '-' ? cust["PIC Name"] : '';
            elements.inputCustomerContact.value = cust["PIC Contact"] && cust["PIC Contact"] !== '-' ? cust["PIC Contact"] : '';
            elements.inputCustomerAddress.value = cust["Address"] && cust["Address"] !== '-' ? cust["Address"] : '';
            elements.inputCustomerStatus.value = cust["Status"] || 'Active';
        }
    } else {
        elements.customerDrawerTitle.textContent = "Tambah Customer Baru";
        elements.btnCustomerSubmitText.textContent = "Simpan Customer";
        
        // Auto-generate Customer ID: cari angka CUST-XXX tertinggi
        let maxNum = 0;
        state.customers.forEach(c => {
            if (c["Customer ID"] && c["Customer ID"].startsWith("CUST-")) {
                let num = parseInt(c["Customer ID"].replace("CUST-", ""), 10);
                if (num > maxNum) maxNum = num;
            }
        });
        elements.inputCustomerId.value = "CUST-" + String(maxNum + 1).padStart(3, '0');
    }

    elements.customerDrawer.classList.add('open');
    elements.drawerOverlay.classList.remove('d-none');
    elements.appContainer.classList.add('drawer-active');
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 320);
}

function normalizeCustomerData(cust, index = 0) {
    if (!cust) return cust;
    
    // Cari key apa saja yang ada di object cust
    const keys = Object.keys(cust);
    
    // Prioritaskan kunci-kunci yang mungkin ada di sheet (termasuk huruf kapital penuh)
    let nameVal = cust["Customer Name"] || cust["customer name"] || cust["CUSTOMER NAME"] || cust["name"] || cust["Name"] || cust["Customer"] || cust["Pelanggan"] || cust["ALL"] || cust["all"];
    
    if (!nameVal && keys.length === 1) {
        nameVal = cust[keys[0]];
    }
    if (!nameVal && keys.length > 0) {
        nameVal = cust[keys.find(k => cust[k] !== "")];
    }
    cust["Customer Name"] = (nameVal || "").toString().trim() || "-";
    
    // Cari ID dengan prioritas: CUSTOMER ID, Customer ID, customer id, CUSTOMER, id, ID
    const idVal = cust["CUSTOMER ID"] || cust["Customer ID"] || cust["customer id"] || cust["CUSTOMER"] || cust["customer"] || cust["id"] || cust["ID"];
    cust["Customer ID"] = idVal ? idVal.toString().trim() : `CUST-${String(index + 1).padStart(3, '0')}`;
    
    cust["Segment"] = cust["Segment"] || cust["segment"] || cust["SEGMENT"] || "-";
    cust["PIC Name"] = cust["PIC Name"] || cust["pic name"] || cust["PIC NAME"] || cust["pic"] || "-";
    cust["PIC Contact"] = cust["PIC Contact"] || cust["pic contact"] || cust["PIC CONTACT"] || cust["contact"] || "-";
    cust["Address"] = cust["Address"] || cust["address"] || cust["ADDRESS"] || "-";
    cust["Status"] = cust["Status"] || cust["status"] || cust["STATUS"] || "Active";
    
    return cust;
}

async function loadCustomers() {
    elements.customerTableList.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="empty-state">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <p>Mengambil data customer...</p>
                </div>
            </td>
        </tr>
    `;

    let hasCache = false;
    // Load from local storage cache instantly first!
    try {
        const cached = JSON.parse(localStorage.getItem('nexus_customers')) || [];
        if (cached.length > 0) {
            state.customers = cached.filter(Boolean).map((c, idx) => normalizeCustomerData(c, idx));
            renderCustomersTable(state.customers);
            populateCustomerDropdowns();
            hasCache = true;
        }
    } catch (e) {
        console.warn("Gagal membaca cache customer:", e);
    }

    if (state.isMockMode) {
        // Mock mode finished loading
        if (state.customers.length === 0) {
            state.customers = mockCustomerSeeds.map((c, idx) => normalizeCustomerData(c, idx));
            localStorage.setItem('nexus_customers', JSON.stringify(mockCustomerSeeds));
            renderCustomersTable(state.customers);
            populateCustomerDropdowns();
        }
    } else {
        // Sync online in background
        try {
            const response = await fetch(`${state.webAppUrl}?action=readAll&sheet=Master Customer&_t=${Date.now()}`);
            if (!response.ok) throw new Error("Server HTTP Error: " + response.status);
            const result = await response.json();
            if (result.status === "success") {
                state.customers = (result.data || []).filter(Boolean).map((c, idx) => normalizeCustomerData(c, idx));
                localStorage.setItem('nexus_customers', JSON.stringify(state.customers));
                renderCustomersTable(state.customers);
                populateCustomerDropdowns();
            } else {
                throw new Error(result.message || "Respon Apps Script gagal.");
            }
        } catch (error) {
            console.error("Gagal sync online customer:", error);
            if (!hasCache) {
                elements.customerTableList.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            <div class="empty-state">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <p>Gagal memuat data online: ${error.message}</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    }
}

function renderCustomersTable(list) {
    elements.customerTableList.innerHTML = '';
    
    if (list.length === 0) {
        elements.customerTableList.innerHTML = `
            <tr class="empty-row">
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>Tidak ada data customer ditemukan.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Urutkan abjad berdasarkan nama pelanggan
    const sorted = [...list].sort((a, b) => {
        return (a["Customer Name"] || "").localeCompare(b["Customer Name"] || "");
    });

    sorted.forEach(cust => {
        const tr = document.createElement('tr');
        const statusClass = `badge-${(cust["Status"] || 'Active').toLowerCase()}`;
        
        tr.innerHTML = `
            <td class="text-mono font-weight-bold" style="color: var(--accent-secondary);">${cust["Customer ID"]}</td>
            <td style="font-weight: 600; color: var(--text-primary);">${cust["Customer Name"] || '-'}</td>
            <td>${cust["Segment"] || '-'}</td>
            <td>${cust["PIC Name"] || '-'}</td>
            <td class="text-mono">${cust["PIC Contact"] || '-'}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${cust["Address"] || ''}">
                ${cust["Address"] || '-'}
            </td>
            <td><span class="badge ${statusClass}">${cust["Status"] || 'Active'}</span></td>
            <td>
                <div class="action-buttons" onclick="event.stopPropagation();">
                    <button class="btn btn-icon-only btn-edit" title="Edit Customer" onclick="openCustomerDrawer('${cust["Customer ID"]}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-icon-only btn-delete" title="Hapus Customer" onclick="deleteCustomer('${cust["Customer ID"]}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        elements.customerTableList.appendChild(tr);
    });
}

async function deleteCustomer(customerId) {
    if (!confirm(`Apakah Anda yakin ingin menghapus customer ${customerId}?`)) return;

    showToast("Menghapus customer...", "info");

    if (state.isMockMode) {
        let data = JSON.parse(localStorage.getItem('nexus_customers')) || [];
        data = data.filter(c => c["Customer ID"] !== customerId);
        localStorage.setItem('nexus_customers', JSON.stringify(data));
        state.customers = data.map(normalizeCustomerData);
        showToast("Customer berhasil dihapus (Luring)", "success");
        loadCustomers();
    } else {
        try {
            await fetch(state.webAppUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: "delete", ticketId: customerId, sheet: "Master Customer" })
            });
            showToast("Customer dihapus. Menyinkronkan...", "success");
            setTimeout(loadCustomers, 1000);
        } catch (error) {
            showToast("Gagal menghapus customer", "error");
        }
    }
}

// Bind Customer Drawer Controls
elements.btnCloseCustomerDrawer.addEventListener('click', closeCustomerDrawer);
elements.btnCancelCustomerDrawer.addEventListener('click', closeCustomerDrawer);
elements.btnAddCustomer.addEventListener('click', () => openCustomerDrawer(null));
elements.btnRefreshCustomers.addEventListener('click', () => {
    localStorage.removeItem('nexus_customers');
    state.customers = [];
    loadCustomers();
    showToast("Mengunduh data customer segar...", "info");
});
elements.drawerOverlay.addEventListener('click', closeCustomerDrawer);

// Search Customer Event Listener
elements.customerSearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = state.customers.filter(c => 
        (c["Customer ID"] && c["Customer ID"].toLowerCase().includes(q)) ||
        (c["Customer Name"] && c["Customer Name"].toLowerCase().includes(q)) ||
        (c["Segment"] && c["Segment"].toLowerCase().includes(q)) ||
        (c["PIC Name"] && c["PIC Name"].toLowerCase().includes(q)) ||
        (c["PIC Contact"] && c["PIC Contact"].toLowerCase().includes(q))
    );
    renderCustomersTable(filtered);
});

// Form Submit Customer Handler
elements.customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate required fields
    let isValid = true;
    const requiredInputs = elements.customerForm.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        const formControl = input.closest('.form-control');
        if (!input.value || input.value.trim() === '') {
            formControl.classList.add('invalid');
            isValid = false;
        } else {
            formControl.classList.remove('invalid');
        }
    });

    if (!isValid) {
        showToast("Mohon isi kolom bertanda bintang (*)", "error");
        return;
    }

    const formData = new FormData(elements.customerForm);
    const customerData = {};
    formData.forEach((value, key) => {
        customerData[key] = value;
    });
    // Duplikasi key untuk mendukung variasi kolom/sheet korporat (termasuk huruf kapital penuh)
    customerData["customer id"] = customerData["Customer ID"];
    customerData["id"] = customerData["Customer ID"];
    customerData["ID"] = customerData["Customer ID"];
    customerData["CUSTOMER"] = customerData["Customer ID"];
    customerData["CUSTOMER ID"] = customerData["Customer ID"];
    
    customerData["customer name"] = customerData["Customer Name"];
    customerData["name"] = customerData["Customer Name"];
    customerData["Name"] = customerData["Customer Name"];
    customerData["CUSTOMER NAME"] = customerData["Customer Name"];
    
    customerData["segment"] = customerData["Segment"];
    customerData["SEGMENT"] = customerData["Segment"];
    
    customerData["pic name"] = customerData["PIC Name"];
    customerData["pic"] = customerData["PIC Name"];
    customerData["PIC"] = customerData["PIC Name"];
    customerData["PIC NAME"] = customerData["PIC Name"];
    
    customerData["pic contact"] = customerData["PIC Contact"];
    customerData["contact"] = customerData["PIC Contact"];
    customerData["Contact"] = customerData["PIC Contact"];
    customerData["PIC CONTACT"] = customerData["PIC Contact"];
    
    customerData["address"] = customerData["Address"];
    customerData["ADDRESS"] = customerData["Address"];
    
    customerData["status"] = customerData["Status"];
    customerData["STATUS"] = customerData["Status"];

    const submitBtn = elements.customerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    showToast("Menyimpan data customer...", "info");

    if (state.isMockMode) {
        const data = JSON.parse(localStorage.getItem('nexus_customers')) || [];
        if (state.currentEditId) {
            const index = data.findIndex(c => c["Customer ID"] === state.currentEditId);
            if (index > -1) {
                data[index] = customerData;
                showToast("Customer berhasil di-update (Luring)", "success");
            }
        } else {
            data.push(customerData);
            showToast("Customer berhasil dibuat (Luring)", "success");
        }
        localStorage.setItem('nexus_customers', JSON.stringify(data));
        closeCustomerDrawer();
        loadCustomers();
        submitBtn.disabled = false;
    } else {
        const actionType = state.currentEditId ? "update" : "create";
        try {
            await fetch(state.webAppUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    action: actionType,
                    ticketId: customerData["Customer ID"],
                    data: customerData,
                    sheet: "Master Customer"
                })
            });
            showToast("Data tersimpan. Menyinkronkan...", "success");
            closeCustomerDrawer();
            setTimeout(loadCustomers, 1000);
        } catch (error) {
            showToast("Gagal menyimpan data online", "error");
        } finally {
            submitBtn.disabled = false;
        }
    }
});

// ==========================================
// 15. CUSTOMER DROPDOWNS INTEGRATION
// ==========================================
function populateCustomerDropdowns() {
    // 1. Dapatkan daftar nama customer unik yang aktif
    const activeCustomers = state.customers
        .filter(c => c && c["Status"] !== 'Inactive')
        .map(c => c["Customer Name"])
        .filter(Boolean);
        
    // Urutkan abjad
    activeCustomers.sort((a, b) => a.localeCompare(b));

    // 2. Isi Dropdown Filter SLA
    if (elements.filterCustomerName) {
        const prevSelected = elements.filterCustomerName.value;
        elements.filterCustomerName.innerHTML = '<option value="">Semua Customer</option>';
        activeCustomers.forEach(customer => {
            const opt = document.createElement('option');
            opt.value = customer;
            opt.textContent = customer;
            elements.filterCustomerName.appendChild(opt);
        });
        if (activeCustomers.includes(prevSelected)) {
            elements.filterCustomerName.value = prevSelected;
        }
    }

    // 3. Isi Datalist Autocomplete Form Tiket
    populateAutocompleteSuggestions();
}

function populateAutocompleteSuggestions() {
    // 1. Isi Autocomplete Customer Name (hanya untuk tiket korporat)
    const customerDatalist = document.getElementById('form-customer-suggestions');
    if (customerDatalist) {
        customerDatalist.innerHTML = '';
        const activeCustomers = state.customers
            .filter(c => c && c["Status"] !== 'Inactive')
            .map(c => c["Customer Name"])
            .filter(Boolean);
        activeCustomers.sort((a, b) => a.localeCompare(b));
        
        activeCustomers.forEach(customer => {
            const opt = document.createElement('option');
            opt.value = customer;
            customerDatalist.appendChild(opt);
        });
    }

    // 2. Isi Autocomplete Vendor (untuk tiket Corporate & Infra)
    const vendorDatalist = document.getElementById('vendor-list-suggestions');
    if (vendorDatalist) {
        vendorDatalist.innerHTML = '';
        const defaultVendors = ["Internal", "PLN", "Telkom", "Lintasarta", "Icon+", "Indosat"];
        defaultVendors.forEach(vendor => {
            const opt = document.createElement('option');
            opt.value = vendor;
            vendorDatalist.appendChild(opt);
        });
    }
}

async function preloadCustomers() {
    // Muat cache instan
    try {
        const cached = JSON.parse(localStorage.getItem('nexus_customers')) || [];
        if (cached.length > 0) {
            state.customers = cached.filter(Boolean).map((c, idx) => normalizeCustomerData(c, idx));
            populateCustomerDropdowns();
        }
    } catch (e) {}

    if (state.isMockMode) {
        if (state.customers.length === 0) {
            state.customers = mockCustomerSeeds.map((c, idx) => normalizeCustomerData(c, idx));
            localStorage.setItem('nexus_customers', JSON.stringify(mockCustomerSeeds));
            populateCustomerDropdowns();
        }
    } else if (state.webAppUrl) {
        try {
            const response = await fetch(`${state.webAppUrl}?action=readAll&sheet=Master Customer&_t=${Date.now()}`);
            if (response.ok) {
                const result = await response.json();
                if (result.status === "success") {
                    state.customers = (result.data || []).filter(Boolean).map((c, idx) => normalizeCustomerData(c, idx));
                    localStorage.setItem('nexus_customers', JSON.stringify(state.customers));
                    populateCustomerDropdowns();
                }
            }
        } catch (e) {
            console.warn("Preload customers online gagal:", e);
        }
    }
}

// ==========================================
// EXECUTIVE DASHBOARD - INFRA TICKET
// ==========================================
let execCharts = {
    trend: null,
    category: null,
    sla: null,
    rootCause: null
};

function formatExecDateToYYYYMMDD(d) {
    if (!d || isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatExecDateDisplay(d) {
    if (!d || isNaN(d.getTime())) return '-';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = String(d.getDate()).padStart(2, '0');
    const mon = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${mon} ${year}`;
}

function getExecChartColors() {
    const isDark = document.body.classList.contains('dark-theme');
    return {
        isDark,
        textColor: isDark ? '#94a3b8' : '#64748b',
        titleColor: isDark ? '#f1f5f9' : '#1e293b',
        gridColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
        tooltipBg: isDark ? '#0f172a' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#cbd5e1',
        tooltipText: isDark ? '#f8fafc' : '#0f172a'
    };
}

async function loadExecInfraDashboard() {
    if (elements.execTicketsList) {
        elements.execTicketsList.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">
                    <div class="empty-state" style="padding: 24px;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 20px; color: var(--accent-secondary); margin-bottom: 8px;"></i>
                        <p>Memuat data Executive Dashboard...</p>
                    </div>
                </td>
            </tr>
        `;
    }

    const dbKey = 'nexus_mock_tickets';
    let data = [];
    try {
        data = JSON.parse(localStorage.getItem(dbKey)) || [];
        if (data.length === 0 && state.isMockMode) {
            const seeded = await seedDatabaseFromCSV();
            if (seeded) {
                data = JSON.parse(localStorage.getItem(dbKey)) || [];
            }
        }
    } catch (e) {
        console.warn("Gagal membaca cache lokal exec infra:", e);
    }

    if (data.length > 0) {
        state.execInfra.tickets = data.map(normalizeTicketData);
        state.tickets = state.execInfra.tickets;
        setDefaultExecDateRange();
        updateExecInfraDashboard();
    }

    // Online background fetch if configured
    if (!state.isMockMode && state.webAppUrl) {
        try {
            const response = await fetch(`${state.webAppUrl}?action=readAll&sheet=Tickets&_t=${Date.now()}`);
            if (response.ok) {
                const result = await response.json();
                if (result.status === "success" && Array.isArray(result.data)) {
                    localStorage.setItem(dbKey, JSON.stringify(result.data));
                    state.execInfra.tickets = result.data.map(normalizeTicketData);
                    state.tickets = state.execInfra.tickets;
                    if (!elements.execFilterStartDate.value || !elements.execFilterEndDate.value) {
                        setDefaultExecDateRange();
                    }
                    updateExecInfraDashboard();
                }
            }
        } catch (error) {
            console.error("Gagal sinkronisasi data online exec infra:", error);
            if (data.length === 0) {
                showToast("Gagal memuat data online. Menggunakan database lokal.", "error");
                state.isMockMode = true;
                updateConnectionBadge();
                const seeded = await seedDatabaseFromCSV();
                if (seeded) {
                    const fallbackData = JSON.parse(localStorage.getItem(dbKey)) || [];
                    state.execInfra.tickets = fallbackData.map(normalizeTicketData);
                    state.tickets = state.execInfra.tickets;
                    setDefaultExecDateRange();
                    updateExecInfraDashboard();
                }
            }
        }
    } else if (data.length === 0) {
        const seeded = await seedDatabaseFromCSV();
        if (seeded) {
            const fallbackData = JSON.parse(localStorage.getItem(dbKey)) || [];
            state.execInfra.tickets = fallbackData.map(normalizeTicketData);
            state.tickets = state.execInfra.tickets;
            setDefaultExecDateRange();
            updateExecInfraDashboard();
        }
    }
}

function setDefaultExecDateRange() {
    const validTickets = (state.execInfra.tickets || []).filter(t => {
        if (!t) return false;
        const d = parseSheetDateToDate(t["Start Time"]);
        return d !== null && !isNaN(d.getTime());
    });

    let startDate, endDate;
    if (validTickets.length > 0) {
        const timestamps = validTickets.map(t => parseSheetDateToDate(t["Start Time"]).getTime());
        const maxTs = Math.max(...timestamps);
        const maxDate = new Date(maxTs);
        endDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
        startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    } else {
        const now = new Date();
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    }

    state.execInfra.startDate = formatExecDateToYYYYMMDD(startDate);
    state.execInfra.endDate = formatExecDateToYYYYMMDD(endDate);

    if (elements.execFilterStartDate) elements.execFilterStartDate.value = state.execInfra.startDate;
    if (elements.execFilterEndDate) elements.execFilterEndDate.value = state.execInfra.endDate;
}

function updateExecInfraDashboard() {
    const startStr = elements.execFilterStartDate ? elements.execFilterStartDate.value : state.execInfra.startDate;
    const endStr = elements.execFilterEndDate ? elements.execFilterEndDate.value : state.execInfra.endDate;

    if (!startStr || !endStr) {
        setDefaultExecDateRange();
    }

    const activeStart = elements.execFilterStartDate ? elements.execFilterStartDate.value : state.execInfra.startDate;
    const activeEnd = elements.execFilterEndDate ? elements.execFilterEndDate.value : state.execInfra.endDate;

    if (!activeStart || !activeEnd) return;

    const startParts = activeStart.split('-');
    const endParts = activeEnd.split('-');
    const startBound = new Date(parseInt(startParts[0], 10), parseInt(startParts[1], 10) - 1, parseInt(startParts[2], 10), 0, 0, 0);
    const endBound = new Date(parseInt(endParts[0], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[2], 10), 23, 59, 59, 999);

    // Filter tickets
    const filtered = (state.execInfra.tickets || []).filter(t => {
        if (!t) return false;
        const d = parseSheetDateToDate(t["Start Time"]);
        return d && d >= startBound && d <= endBound;
    });

    state.execInfra.filteredTickets = filtered;

    // Period Display
    if (elements.execPeriodDisplay) {
        elements.execPeriodDisplay.textContent = `${formatExecDateDisplay(startBound)} s/d ${formatExecDateDisplay(endBound)}`;
    }
    if (elements.execTableSummaryTitle) {
        elements.execTableSummaryTitle.textContent = `TICKET DETAIL — ${filtered.length} TICKETS`;
    }
    if (elements.execTableSummarySub) {
        elements.execTableSummarySub.textContent = `Showing tickets from ${formatExecDateDisplay(startBound)} to ${formatExecDateDisplay(endBound)}`;
    }

    // 5 KPIs
    const totalCount = filtered.length;
    const resolvedCount = filtered.filter(t => {
        const s = (t["Status"] || '').toLowerCase();
        return s === 'resolved' || s === 'closed';
    }).length;

    const openCount = filtered.filter(t => {
        const s = (t["Status"] || '').toLowerCase();
        return s === 'open' || s === 'in progress' || s === 'progress' || s === 'on hold';
    }).length;

    const criticalCount = filtered.filter(t => {
        return (t["Severity"] || '').toLowerCase() === 'critical';
    }).length;

    // SLA Calculation
    let metCount = 0;
    let breachCount = 0;
    filtered.forEach(t => {
        const slaDurationStr = getCleanSlaDuration(t);
        const slaMinutes = parseDurationToMinutes(slaDurationStr);
        const st = (t["Status"] || '').toLowerCase();
        if (st === 'resolved' || st === 'closed') {
            if (slaMinutes <= 240) metCount++;
            else breachCount++;
        } else {
            const start = parseSheetDateToDate(t["Start Time"]);
            if (start) {
                const elapsedMin = Math.floor((Date.now() - start.getTime()) / 60000);
                if (elapsedMin > 240) breachCount++;
                else metCount++;
            } else {
                metCount++;
            }
        }
    });

    const slaComplianceRate = totalCount > 0 ? ((metCount / totalCount) * 100).toFixed(1) : (100.0).toFixed(1);

    // Update KPI UI
    if (elements.execKpiTotal) elements.execKpiTotal.textContent = totalCount;
    if (elements.execKpiTotalFoot) elements.execKpiTotalFoot.textContent = `${totalCount} tiket dalam periode`;

    if (elements.execKpiResolved) elements.execKpiResolved.textContent = resolvedCount;
    if (elements.execKpiResolvedFoot) {
        const resPct = totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) : 0;
        elements.execKpiResolvedFoot.textContent = `${resPct}% dari total tiket`;
    }

    if (elements.execKpiOpen) elements.execKpiOpen.textContent = openCount;
    if (elements.execKpiOpenFoot) elements.execKpiOpenFoot.textContent = "Tiket aktif dalam penanganan";

    if (elements.execKpiCritical) elements.execKpiCritical.textContent = criticalCount;
    if (elements.execKpiCriticalFoot) {
        const critPct = totalCount > 0 ? ((criticalCount / totalCount) * 100).toFixed(1) : 0;
        elements.execKpiCriticalFoot.textContent = `${critPct}% severity critical`;
    }

    if (elements.execKpiSla) elements.execKpiSla.textContent = `${slaComplianceRate}%`;
    if (elements.execKpiSlaFoot) elements.execKpiSlaFoot.textContent = `${metCount} Met / ${breachCount} Breach (≤ 4 Jam)`;

    if (elements.execDonutSlaVal) elements.execDonutSlaVal.textContent = `${Math.round(parseFloat(slaComplianceRate))}%`;
    if (elements.execSlaMetCnt) elements.execSlaMetCnt.textContent = `${metCount} Tiket (${slaComplianceRate}%)`;
    if (elements.execSlaBreachCnt) {
        const breachPct = totalCount > 0 ? (100 - parseFloat(slaComplianceRate)).toFixed(1) : 0;
        elements.execSlaBreachCnt.textContent = `${breachCount} Tiket (${breachPct}%)`;
    }

    // Render Charts
    renderExecChartTrend(filtered, startBound, endBound);
    renderExecChartCategory(filtered);
    renderExecChartSla(metCount, breachCount);
    renderExecChartRootCause(filtered);

    // Render Table
    state.execInfra.currentPage = 1;
    renderExecDetailTable();
}

// 7. CHART: TICKET TREND (Daily Line Chart)
function renderExecChartTrend(filtered, startBound, endBound) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('exec-chart-trend');
    if (!canvas) return;

    if (execCharts.trend) {
        execCharts.trend.destroy();
        execCharts.trend = null;
    }

    const colors = getExecChartColors();
    const labels = [];
    const counts = [];
    const cur = new Date(startBound.getFullYear(), startBound.getMonth(), startBound.getDate());
    const end = new Date(endBound.getFullYear(), endBound.getMonth(), endBound.getDate());

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    while (cur <= end) {
        const dayKey = formatExecDateToYYYYMMDD(cur);
        const dayDisplay = `${cur.getDate()} ${months[cur.getMonth()]}`;
        labels.push(dayDisplay);

        const dailyCount = filtered.filter(t => {
            const d = parseSheetDateToDate(t["Start Time"]);
            return d && formatExecDateToYYYYMMDD(d) === dayKey;
        }).length;
        counts.push(dailyCount);

        cur.setDate(cur.getDate() + 1);
    }

    const ctx = canvas.getContext('2d');
    execCharts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Jumlah Tiket',
                data: counts,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.14)',
                fill: true,
                tension: 0.35,
                borderWidth: 2.5,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: colors.isDark ? '#0f172a' : '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4,
                    callbacks: {
                        label: (ctx) => ` ${ctx.parsed.y} Tiket`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: colors.gridColor },
                    ticks: { color: colors.textColor, font: { family: 'Outfit', size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: colors.textColor,
                        font: { family: 'Outfit', size: 11 },
                        precision: 0
                    },
                    grid: { color: colors.gridColor }
                }
            }
        }
    });
}

// 8. CHART: TICKET CATEGORY (Horizontal Bar Chart)
function renderExecChartCategory(filtered) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('exec-chart-category');
    if (!canvas) return;

    if (execCharts.category) {
        execCharts.category.destroy();
        execCharts.category = null;
    }

    const colors = getExecChartColors();
    const catMap = {};
    filtered.forEach(t => {
        const cat = (t["Infra Category"] || 'Uncategorized').trim();
        catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const sortedCats = Object.keys(catMap)
        .map(key => ({ category: key, count: catMap[key] }))
        .sort((a, b) => b.count - a.count);

    const labels = sortedCats.length > 0 ? sortedCats.map(c => c.category) : ['Belum ada data'];
    const dataVals = sortedCats.length > 0 ? sortedCats.map(c => c.count) : [0];

    const palette = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'];
    const bgColors = labels.map((_, i) => palette[i % palette.length]);

    const ctx = canvas.getContext('2d');
    execCharts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Jumlah Tiket',
                data: dataVals,
                backgroundColor: bgColors,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => ` ${ctx.parsed.x} Tiket`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: colors.textColor, precision: 0, font: { family: 'Outfit', size: 11 } },
                    grid: { color: colors.gridColor }
                },
                y: {
                    ticks: { color: colors.textColor, font: { family: 'Outfit', size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// 9. CHART: SLA PERFORMANCE (Donut Chart)
function renderExecChartSla(metCount, breachCount) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('exec-chart-sla');
    if (!canvas) return;

    if (execCharts.sla) {
        execCharts.sla.destroy();
        execCharts.sla = null;
    }

    const colors = getExecChartColors();
    const total = metCount + breachCount;
    const dataVals = total === 0 ? [1] : [metCount, breachCount];
    const bgColors = total === 0 ? ['#475569'] : ['#10b981', '#ef4444'];
    const labels = total === 0 ? ['Belum ada data'] : ['SLA Met (≤ 4 Jam)', 'SLA Breach (> 4 Jam)'];

    const ctx = canvas.getContext('2d');
    execCharts.sla = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: dataVals,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: colors.isDark ? '#1e293b' : '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => {
                            if (total === 0) return ' Tidak ada tiket';
                            const pct = ((ctx.parsed / total) * 100).toFixed(1);
                            return ` ${ctx.label}: ${ctx.parsed} Tiket (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 10. CHART: ROOT CAUSE (Donut Chart)
function renderExecChartRootCause(filtered) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('exec-chart-rootcause');
    if (!canvas) return;

    if (execCharts.rootCause) {
        execCharts.rootCause.destroy();
        execCharts.rootCause = null;
    }

    const colors = getExecChartColors();
    const rcMap = {};
    filtered.forEach(t => {
        const rc = (t["Root Cause L1"] || 'Unspecified').trim();
        rcMap[rc] = (rcMap[rc] || 0) + 1;
    });

    const sortedRc = Object.keys(rcMap)
        .map(key => ({ name: key, count: rcMap[key] }))
        .sort((a, b) => b.count - a.count);

    let topRc = [];
    if (sortedRc.length <= 4) {
        topRc = sortedRc;
    } else {
        topRc = sortedRc.slice(0, 4);
        const restSum = sortedRc.slice(4).reduce((acc, cur) => acc + cur.count, 0);
        if (restSum > 0) {
            topRc.push({ name: 'Other', count: restSum });
        }
    }

    const labels = topRc.length > 0 ? topRc.map(r => r.name) : ['Belum ada data'];
    const dataVals = topRc.length > 0 ? topRc.map(r => r.count) : [1];
    const totalCount = filtered.length || 1;

    const palette = ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#64748b', '#ec4899'];
    const bgColors = topRc.length > 0 ? labels.map((_, i) => palette[i % palette.length]) : ['#475569'];

    const ctx = canvas.getContext('2d');
    execCharts.rootCause = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: dataVals,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: colors.isDark ? '#1e293b' : '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.textColor,
                        font: { family: 'Outfit', size: 11 },
                        padding: 10,
                        boxWidth: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => {
                            if (filtered.length === 0) return ' Tidak ada tiket';
                            const pct = ((ctx.parsed / totalCount) * 100).toFixed(1);
                            return ` ${ctx.label}: ${ctx.parsed} Tiket (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 12 & 13. TICKET DETAIL TABLE
function renderExecDetailTable() {
    if (!elements.execTicketsList) return;
    elements.execTicketsList.innerHTML = '';

    let list = [...(state.execInfra.filteredTickets || [])];
    const q = (state.execInfra.searchQuery || '').trim().toLowerCase();
    if (q) {
        list = list.filter(t => {
            const id = (t["Ticket ID"] || '').toLowerCase();
            const site = (t["Site / POP"] || '').toLowerCase();
            const cat = (t["Infra Category"] || '').toLowerCase();
            const act = (t["Activity Type"] || '').toLowerCase();
            const rc = (t["Root Cause L1"] || '').toLowerCase();
            const rcd = (t["Root Cause Detail"] || '').toLowerCase();
            const title = (t["Title"] || '').toLowerCase();
            return id.includes(q) || site.includes(q) || cat.includes(q) || act.includes(q) || rc.includes(q) || rcd.includes(q) || title.includes(q);
        });
    }

    // Sort
    const sortField = state.execInfra.sortField || 'Start Time';
    const sortAsc = state.execInfra.sortAsc;
    list.sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (sortField === 'Start Time') {
            const dA = parseSheetDateToDate(valA);
            const dB = parseSheetDateToDate(valB);
            valA = dA ? dA.getTime() : 0;
            valB = dB ? dB.getTime() : 0;
        } else if (sortField === 'Actual Duration' || sortField === 'SLA Duration') {
            valA = parseDurationToMinutes(valA);
            valB = parseDurationToMinutes(valB);
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });

    const totalItems = list.length;
    const pageSize = state.execInfra.pageSize || 10;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (state.execInfra.currentPage > totalPages) state.execInfra.currentPage = totalPages;
    if (state.execInfra.currentPage < 1) state.execInfra.currentPage = 1;

    const startIdx = (state.execInfra.currentPage - 1) * pageSize;
    const pageItems = list.slice(startIdx, startIdx + pageSize);

    if (elements.execPaginationInfo) {
        elements.execPaginationInfo.textContent = totalItems === 0 
            ? "Menampilkan 0 dari 0 tiket" 
            : `Menampilkan ${startIdx + 1} - ${Math.min(startIdx + pageSize, totalItems)} dari ${totalItems} tiket`;
    }
    if (elements.execPageNum) elements.execPageNum.textContent = state.execInfra.currentPage;
    if (elements.btnExecPrev) elements.btnExecPrev.disabled = state.execInfra.currentPage <= 1;
    if (elements.btnExecNext) elements.btnExecNext.disabled = state.execInfra.currentPage >= totalPages;

    if (pageItems.length === 0) {
        elements.execTicketsList.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">
                    <div class="empty-state" style="padding: 30px;">
                        <i class="fa-solid fa-inbox" style="font-size: 24px; color: var(--text-muted); margin-bottom: 8px;"></i>
                        <p>Tidak ada tiket pada periode atau kriteria pencarian ini.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    pageItems.forEach(ticket => {
        let sevClass = 'badge-minor';
        const sev = (ticket["Severity"] || '').toLowerCase();
        if (sev === 'critical') sevClass = 'badge-critical';
        else if (sev === 'major') sevClass = 'badge-major';
        else if (sev === 'minor') sevClass = 'badge-minor';
        else if (sev === 'low') sevClass = 'badge-low';

        let statusClass = 'badge-open';
        const st = (ticket["Status"] || '').toLowerCase();
        if (st === 'resolved' || st === 'closed') statusClass = 'badge-resolved';
        else if (st === 'in progress' || st === 'progress') statusClass = 'badge-inprogress';
        else if (st === 'on hold') statusClass = 'badge-pending';

        const actualDur = getCleanDuration(ticket);
        const slaDur = getCleanSlaDuration(ticket);
        const slaMin = parseDurationToMinutes(slaDur);
        const slaPill = slaMin <= 240
            ? `<span class="sla-pill met" title="SLA Met (≤ 4 Jam)"><i class="fa-solid fa-circle-check"></i> ${slaDur}</span>`
            : `<span class="sla-pill breach" title="SLA Breach (> 4 Jam)"><i class="fa-solid fa-triangle-exclamation"></i> ${slaDur}</span>`;

        const tr = document.createElement('tr');
        tr.className = 'exec-row-clickable';
        tr.innerHTML = `
            <td class="text-mono font-weight-bold" style="color: var(--accent-secondary);">${ticket["Ticket ID"] || '-'}</td>
            <td class="text-mono" style="font-size: 12px;">${formatDateTimeString(ticket["Start Time"])}</td>
            <td style="font-weight: 500;">${ticket["Site / POP"] || '-'}</td>
            <td>${ticket["Infra Category"] || '-'}</td>
            <td><span class="badge badge-subtle">${ticket["Activity Type"] || '-'}</span></td>
            <td><span class="badge ${sevClass}">${ticket["Severity"] || '-'}</span></td>
            <td><span class="badge ${statusClass}">${ticket["Status"] || '-'}</span></td>
            <td class="text-mono" style="font-size: 12px;">${actualDur}</td>
            <td class="text-mono" style="font-size: 12px;">${slaPill}</td>
            <td style="font-size: 12px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ticket["Root Cause L1"] || ''}">${ticket["Root Cause L1"] || '-'}</td>
        `;

        tr.addEventListener('click', () => {
            state.tickets = state.execInfra.tickets;
            openDetailDrawer(ticket["Ticket ID"]);
        });

        elements.execTicketsList.appendChild(tr);
    });
}

function bindExecDashboardEvents() {
    if (elements.btnExecApply) {
        elements.btnExecApply.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.execFilterStartDate && elements.execFilterEndDate) {
                if (elements.execFilterStartDate.value > elements.execFilterEndDate.value) {
                    showToast("Start Date tidak boleh lebih besar dari End Date", "error");
                    return;
                }
                state.execInfra.startDate = elements.execFilterStartDate.value;
                state.execInfra.endDate = elements.execFilterEndDate.value;
            }
            updateExecInfraDashboard();
            showToast("Filter periode diterapkan", "success");
        });
    }

    if (elements.btnExecReset) {
        elements.btnExecReset.addEventListener('click', (e) => {
            e.preventDefault();
            state.execInfra.startDate = '';
            state.execInfra.endDate = '';
            setDefaultExecDateRange();
            updateExecInfraDashboard();
            showToast("Periode dikembalikan ke default mingguan", "info");
        });
    }

    if (elements.execTableSearch) {
        elements.execTableSearch.addEventListener('input', (e) => {
            state.execInfra.searchQuery = e.target.value;
            state.execInfra.currentPage = 1;
            renderExecDetailTable();
        });
    }

    if (elements.btnExecPrev) {
        elements.btnExecPrev.addEventListener('click', () => {
            if (state.execInfra.currentPage > 1) {
                state.execInfra.currentPage--;
                renderExecDetailTable();
            }
        });
    }

    if (elements.btnExecNext) {
        elements.btnExecNext.addEventListener('click', () => {
            state.execInfra.currentPage++;
            renderExecDetailTable();
        });
    }

    // Sort column headers
    document.querySelectorAll('#exec-tickets-table th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-sort');
            if (state.execInfra.sortField === field) {
                state.execInfra.sortAsc = !state.execInfra.sortAsc;
            } else {
                state.execInfra.sortField = field;
                state.execInfra.sortAsc = field === 'Start Time' ? false : true;
            }
            document.querySelectorAll('#exec-tickets-table th[data-sort] i').forEach(icon => {
                icon.className = 'fa-solid fa-sort';
            });
            const icon = th.querySelector('i');
            if (icon) {
                icon.className = state.execInfra.sortAsc ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
            }
            renderExecDetailTable();
        });
    });
}

// ==========================================
// EXECUTIVE DASHBOARD - CORPORATE TICKET
// ==========================================
let execCorpCharts = {
    trend: null,
    category: null,
    sla: null,
    rootCause: null
};

async function loadExecCorpDashboard() {
    if (elements.execCorpTicketsList) {
        elements.execCorpTicketsList.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">
                    <div class="empty-state" style="padding: 24px;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 20px; color: var(--accent-secondary); margin-bottom: 8px;"></i>
                        <p>Memuat data Executive Dashboard Corporate...</p>
                    </div>
                </td>
            </tr>
        `;
    }

    const dbKey = 'nexus_corporate_tickets';
    let data = [];
    try {
        data = JSON.parse(localStorage.getItem(dbKey)) || [];
        if (data.length === 0) {
            data = mockCorporateSeeds;
            localStorage.setItem(dbKey, JSON.stringify(mockCorporateSeeds));
        }
    } catch (e) {
        console.warn("Gagal membaca cache lokal exec corp:", e);
    }

    if (data.length > 0) {
        state.execCorp.tickets = data.map(normalizeTicketData);
        state.tickets = state.execCorp.tickets;
        setDefaultExecCorpDateRange();
        updateExecCorpDashboard();
    }

    // Online background fetch if configured
    if (!state.isMockMode && state.webAppUrl) {
        try {
            const response = await fetch(`${state.webAppUrl}?action=readAll&sheet=Corporate&_t=${Date.now()}`);
            if (response.ok) {
                const result = await response.json();
                if (result.status === "success" && Array.isArray(result.data)) {
                    localStorage.setItem(dbKey, JSON.stringify(result.data));
                    state.execCorp.tickets = result.data.map(normalizeTicketData);
                    state.tickets = state.execCorp.tickets;
                    if (!elements.execCorpFilterStartDate.value || !elements.execCorpFilterEndDate.value) {
                        setDefaultExecCorpDateRange();
                    }
                    updateExecCorpDashboard();
                }
            }
        } catch (error) {
            console.error("Gagal sinkronisasi data online exec corp:", error);
            if (data.length === 0) {
                showToast("Gagal memuat data online. Menggunakan data demo.", "error");
                const fallbackData = mockCorporateSeeds;
                state.execCorp.tickets = fallbackData.map(normalizeTicketData);
                state.tickets = state.execCorp.tickets;
                setDefaultExecCorpDateRange();
                updateExecCorpDashboard();
            }
        }
    }
}

function setDefaultExecCorpDateRange() {
    const validTickets = (state.execCorp.tickets || []).filter(t => {
        if (!t) return false;
        const d = parseSheetDateToDate(t["Start Time"]);
        return d !== null && !isNaN(d.getTime());
    });

    let startDate, endDate;
    if (validTickets.length > 0) {
        const timestamps = validTickets.map(t => parseSheetDateToDate(t["Start Time"]).getTime());
        const maxTs = Math.max(...timestamps);
        const maxDate = new Date(maxTs);
        endDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
        startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    } else {
        const now = new Date();
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    }

    state.execCorp.startDate = formatExecDateToYYYYMMDD(startDate);
    state.execCorp.endDate = formatExecDateToYYYYMMDD(endDate);

    if (elements.execCorpFilterStartDate) elements.execCorpFilterStartDate.value = state.execCorp.startDate;
    if (elements.execCorpFilterEndDate) elements.execCorpFilterEndDate.value = state.execCorp.endDate;
}

function updateExecCorpDashboard() {
    const startStr = elements.execCorpFilterStartDate ? elements.execCorpFilterStartDate.value : state.execCorp.startDate;
    const endStr = elements.execCorpFilterEndDate ? elements.execCorpFilterEndDate.value : state.execCorp.endDate;

    if (!startStr || !endStr) {
        setDefaultExecCorpDateRange();
    }

    const activeStart = elements.execCorpFilterStartDate ? elements.execCorpFilterStartDate.value : state.execCorp.startDate;
    const activeEnd = elements.execCorpFilterEndDate ? elements.execCorpFilterEndDate.value : state.execCorp.endDate;

    if (!activeStart || !activeEnd) return;

    const startParts = activeStart.split('-');
    const endParts = activeEnd.split('-');
    const startBound = new Date(parseInt(startParts[0], 10), parseInt(startParts[1], 10) - 1, parseInt(startParts[2], 10), 0, 0, 0);
    const endBound = new Date(parseInt(endParts[0], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[2], 10), 23, 59, 59, 999);

    // Filter tickets
    const filtered = (state.execCorp.tickets || []).filter(t => {
        if (!t) return false;
        const d = parseSheetDateToDate(t["Start Time"]);
        return d && d >= startBound && d <= endBound;
    });

    state.execCorp.filteredTickets = filtered;

    // Period Display
    if (elements.execCorpPeriodDisplay) {
        elements.execCorpPeriodDisplay.textContent = `${formatExecDateDisplay(startBound)} s/d ${formatExecDateDisplay(endBound)}`;
    }
    if (elements.execCorpTableSummaryTitle) {
        elements.execCorpTableSummaryTitle.textContent = `TICKET DETAIL — ${filtered.length} TICKETS`;
    }
    if (elements.execCorpTableSummarySub) {
        elements.execCorpTableSummarySub.textContent = `Showing tickets from ${formatExecDateDisplay(startBound)} to ${formatExecDateDisplay(endBound)}`;
    }

    // 5 KPIs
    const totalCount = filtered.length;
    const resolvedCount = filtered.filter(t => {
        const s = (t["Status"] || '').toLowerCase();
        return s === 'resolved' || s === 'closed';
    }).length;

    const openCount = filtered.filter(t => {
        const s = (t["Status"] || '').toLowerCase();
        return s === 'open' || s === 'in progress' || s === 'progress' || s === 'on hold';
    }).length;

    const criticalCount = filtered.filter(t => {
        return (t["Severity"] || '').toLowerCase() === 'critical';
    }).length;

    // SLA Calculation
    let metCount = 0;
    let breachCount = 0;
    filtered.forEach(t => {
        const slaDurationStr = getCleanSlaDuration(t);
        const slaMinutes = parseDurationToMinutes(slaDurationStr);
        const st = (t["Status"] || '').toLowerCase();
        if (st === 'resolved' || st === 'closed') {
            if (slaMinutes <= 240) metCount++;
            else breachCount++;
        } else {
            const start = parseSheetDateToDate(t["Start Time"]);
            if (start) {
                const elapsedMin = Math.floor((Date.now() - start.getTime()) / 60000);
                if (elapsedMin > 240) breachCount++;
                else metCount++;
            } else {
                metCount++;
            }
        }
    });

    const slaComplianceRate = totalCount > 0 ? ((metCount / totalCount) * 100).toFixed(1) : (100.0).toFixed(1);

    // Update KPI UI
    if (elements.execCorpKpiTotal) elements.execCorpKpiTotal.textContent = totalCount;
    if (elements.execCorpKpiTotalFoot) elements.execCorpKpiTotalFoot.textContent = `${totalCount} tiket dalam periode`;

    if (elements.execCorpKpiResolved) elements.execCorpKpiResolved.textContent = resolvedCount;
    if (elements.execCorpKpiResolvedFoot) {
        const resPct = totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) : 0;
        elements.execCorpKpiResolvedFoot.textContent = `${resPct}% dari total tiket`;
    }

    if (elements.execCorpKpiOpen) elements.execCorpKpiOpen.textContent = openCount;
    if (elements.execCorpKpiOpenFoot) elements.execCorpKpiOpenFoot.textContent = "Tiket aktif dalam penanganan";

    if (elements.execCorpKpiCritical) elements.execCorpKpiCritical.textContent = criticalCount;
    if (elements.execCorpKpiCriticalFoot) {
        const critPct = totalCount > 0 ? ((criticalCount / totalCount) * 100).toFixed(1) : 0;
        elements.execCorpKpiCriticalFoot.textContent = `${critPct}% severity critical`;
    }

    if (elements.execCorpKpiSla) elements.execCorpKpiSla.textContent = `${slaComplianceRate}%`;
    if (elements.execCorpKpiSlaFoot) elements.execCorpKpiSlaFoot.textContent = `${metCount} Met / ${breachCount} Breach (≤ 4 Jam)`;

    if (elements.execCorpDonutSlaVal) elements.execCorpDonutSlaVal.textContent = `${Math.round(parseFloat(slaComplianceRate))}%`;
    if (elements.execCorpSlaMetCnt) elements.execCorpSlaMetCnt.textContent = `${metCount} Tiket (${slaComplianceRate}%)`;
    if (elements.execCorpSlaBreachCnt) {
        const breachPct = totalCount > 0 ? (100 - parseFloat(slaComplianceRate)).toFixed(1) : 0;
        elements.execCorpSlaBreachCnt.textContent = `${breachCount} Tiket (${breachPct}%)`;
    }

    // Render Charts
    renderExecCorpChartTrend(filtered, startBound, endBound);
    renderExecCorpChartCategory(filtered);
    renderExecCorpChartSla(metCount, breachCount);
    renderExecCorpChartRootCause(filtered);

    // Render Table
    state.execCorp.currentPage = 1;
    renderExecCorpDetailTable();
}

// 7. CHART: TICKET TREND (Daily Line Chart)
function renderExecCorpChartTrend(filtered, startBound, endBound) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('exec-corp-chart-trend');
    if (!canvas) return;

    if (execCorpCharts.trend) {
        execCorpCharts.trend.destroy();
        execCorpCharts.trend = null;
    }

    const colors = getExecChartColors();
    const labels = [];
    const counts = [];
    const cur = new Date(startBound.getFullYear(), startBound.getMonth(), startBound.getDate());
    const end = new Date(endBound.getFullYear(), endBound.getMonth(), endBound.getDate());

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    while (cur <= end) {
        const dayKey = formatExecDateToYYYYMMDD(cur);
        const dayDisplay = `${cur.getDate()} ${months[cur.getMonth()]}`;
        labels.push(dayDisplay);

        const dailyCount = filtered.filter(t => {
            const d = parseSheetDateToDate(t["Start Time"]);
            return d && formatExecDateToYYYYMMDD(d) === dayKey;
        }).length;
        counts.push(dailyCount);

        cur.setDate(cur.getDate() + 1);
    }

    const ctx = canvas.getContext('2d');
    execCorpCharts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Jumlah Tiket',
                data: counts,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.14)',
                fill: true,
                tension: 0.35,
                borderWidth: 2.5,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: colors.isDark ? '#0f172a' : '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4,
                    callbacks: {
                        label: (ctx) => ` ${ctx.parsed.y} Tiket`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: colors.gridColor },
                    ticks: { color: colors.textColor, font: { family: 'Outfit', size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: colors.textColor,
                        font: { family: 'Outfit', size: 11 },
                        precision: 0
                    },
                    grid: { color: colors.gridColor }
                }
            }
        }
    });
}

// 8. CHART: SERVICE TYPE / CATEGORY (Horizontal Bar Chart)
function renderExecCorpChartCategory(filtered) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('exec-corp-chart-category');
    if (!canvas) return;

    if (execCorpCharts.category) {
        execCorpCharts.category.destroy();
        execCorpCharts.category = null;
    }

    const colors = getExecChartColors();
    const catMap = {};
    filtered.forEach(t => {
        const cat = (t["Service Type"] || t["Infra Category"] || 'Uncategorized').trim();
        catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const sortedCats = Object.keys(catMap)
        .map(key => ({ category: key, count: catMap[key] }))
        .sort((a, b) => b.count - a.count);

    const labels = sortedCats.length > 0 ? sortedCats.map(c => c.category) : ['Belum ada data'];
    const dataVals = sortedCats.length > 0 ? sortedCats.map(c => c.count) : [0];

    const palette = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'];
    const bgColors = labels.map((_, i) => palette[i % palette.length]);

    const ctx = canvas.getContext('2d');
    execCorpCharts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Jumlah Tiket',
                data: dataVals,
                backgroundColor: bgColors,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => ` ${ctx.parsed.x} Tiket`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: colors.textColor, precision: 0, font: { family: 'Outfit', size: 11 } },
                    grid: { color: colors.gridColor }
                },
                y: {
                    ticks: { color: colors.textColor, font: { family: 'Outfit', size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// 9. CHART: SLA PERFORMANCE (Donut Chart)
function renderExecCorpChartSla(metCount, breachCount) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('exec-corp-chart-sla');
    if (!canvas) return;

    if (execCorpCharts.sla) {
        execCorpCharts.sla.destroy();
        execCorpCharts.sla = null;
    }

    const colors = getExecChartColors();
    const total = metCount + breachCount;
    const dataVals = total === 0 ? [1] : [metCount, breachCount];
    const bgColors = total === 0 ? ['#475569'] : ['#10b981', '#ef4444'];
    const labels = total === 0 ? ['Belum ada data'] : ['SLA Met (≤ 4 Jam)', 'SLA Breach (> 4 Jam)'];

    const ctx = canvas.getContext('2d');
    execCorpCharts.sla = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: dataVals,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: colors.isDark ? '#1e293b' : '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => {
                            if (total === 0) return ' Tidak ada tiket';
                            const pct = ((ctx.parsed / total) * 100).toFixed(1);
                            return ` ${ctx.label}: ${ctx.parsed} Tiket (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 10. CHART: ROOT CAUSE (Donut Chart)
function renderExecCorpChartRootCause(filtered) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('exec-corp-chart-rootcause');
    if (!canvas) return;

    if (execCorpCharts.rootCause) {
        execCorpCharts.rootCause.destroy();
        execCorpCharts.rootCause = null;
    }

    const colors = getExecChartColors();
    const rcMap = {};
    filtered.forEach(t => {
        const rc = (t["Root Cause L1"] || 'Unspecified').trim();
        rcMap[rc] = (rcMap[rc] || 0) + 1;
    });

    const sortedRc = Object.keys(rcMap)
        .map(key => ({ name: key, count: rcMap[key] }))
        .sort((a, b) => b.count - a.count);

    let topRc = [];
    if (sortedRc.length <= 4) {
        topRc = sortedRc;
    } else {
        topRc = sortedRc.slice(0, 4);
        const restSum = sortedRc.slice(4).reduce((acc, cur) => acc + cur.count, 0);
        if (restSum > 0) {
            topRc.push({ name: 'Other', count: restSum });
        }
    }

    const labels = topRc.length > 0 ? topRc.map(r => r.name) : ['Belum ada data'];
    const dataVals = topRc.length > 0 ? topRc.map(r => r.count) : [1];
    const totalCount = filtered.length || 1;

    const palette = ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#64748b', '#ec4899'];
    const bgColors = topRc.length > 0 ? labels.map((_, i) => palette[i % palette.length]) : ['#475569'];

    const ctx = canvas.getContext('2d');
    execCorpCharts.rootCause = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: dataVals,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: colors.isDark ? '#1e293b' : '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.textColor,
                        font: { family: 'Outfit', size: 11 },
                        padding: 10,
                        boxWidth: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => {
                            if (filtered.length === 0) return ' Tidak ada tiket';
                            const pct = ((ctx.parsed / totalCount) * 100).toFixed(1);
                            return ` ${ctx.label}: ${ctx.parsed} Tiket (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 12 & 13. TICKET DETAIL TABLE
function renderExecCorpDetailTable() {
    if (!elements.execCorpTicketsList) return;
    elements.execCorpTicketsList.innerHTML = '';

    let list = [...(state.execCorp.filteredTickets || [])];
    const q = (state.execCorp.searchQuery || '').trim().toLowerCase();
    if (q) {
        list = list.filter(t => {
            const id = (t["Ticket ID"] || '').toLowerCase();
            const cust = (t["Customer Name"] || t["Vendor"] || '').toLowerCase();
            const serv = (t["Service ID"] || t["Link / Device"] || '').toLowerCase();
            const type = (t["Service Type"] || t["Infra Category"] || '').toLowerCase();
            const act = (t["Activity Type"] || '').toLowerCase();
            const rc = (t["Root Cause L1"] || '').toLowerCase();
            const rcd = (t["Root Cause Detail"] || '').toLowerCase();
            const title = (t["Title"] || '').toLowerCase();
            return id.includes(q) || cust.includes(q) || serv.includes(q) || type.includes(q) || act.includes(q) || rc.includes(q) || rcd.includes(q) || title.includes(q);
        });
    }

    // Sort
    const sortField = state.execCorp.sortField || 'Start Time';
    const sortAsc = state.execCorp.sortAsc;
    list.sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (sortField === 'Start Time') {
            const dA = parseSheetDateToDate(valA);
            const dB = parseSheetDateToDate(valB);
            valA = dA ? dA.getTime() : 0;
            valB = dB ? dB.getTime() : 0;
        } else if (sortField === 'Actual Duration' || sortField === 'SLA Duration') {
            valA = parseDurationToMinutes(valA);
            valB = parseDurationToMinutes(valB);
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });

    const totalItems = list.length;
    const pageSize = state.execCorp.pageSize || 10;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (state.execCorp.currentPage > totalPages) state.execCorp.currentPage = totalPages;
    if (state.execCorp.currentPage < 1) state.execCorp.currentPage = 1;

    const startIdx = (state.execCorp.currentPage - 1) * pageSize;
    const pageItems = list.slice(startIdx, startIdx + pageSize);

    if (elements.execCorpPaginationInfo) {
        elements.execCorpPaginationInfo.textContent = totalItems === 0 
            ? "Menampilkan 0 dari 0 tiket" 
            : `Menampilkan ${startIdx + 1} - ${Math.min(startIdx + pageSize, totalItems)} dari ${totalItems} tiket`;
    }
    if (elements.execCorpPageNum) elements.execCorpPageNum.textContent = state.execCorp.currentPage;
    if (elements.btnExecCorpPrev) elements.btnExecCorpPrev.disabled = state.execCorp.currentPage <= 1;
    if (elements.btnExecCorpNext) elements.btnExecCorpNext.disabled = state.execCorp.currentPage >= totalPages;

    if (pageItems.length === 0) {
        elements.execCorpTicketsList.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">
                    <div class="empty-state" style="padding: 30px;">
                        <i class="fa-solid fa-inbox" style="font-size: 24px; color: var(--text-muted); margin-bottom: 8px;"></i>
                        <p>Tidak ada tiket pada periode atau kriteria pencarian ini.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    pageItems.forEach(ticket => {
        let sevClass = 'badge-minor';
        const sev = (ticket["Severity"] || '').toLowerCase();
        if (sev === 'critical') sevClass = 'badge-critical';
        else if (sev === 'major') sevClass = 'badge-major';
        else if (sev === 'minor') sevClass = 'badge-minor';
        else if (sev === 'low') sevClass = 'badge-low';

        let statusClass = 'badge-open';
        const st = (ticket["Status"] || '').toLowerCase();
        if (st === 'resolved' || st === 'closed') statusClass = 'badge-resolved';
        else if (st === 'in progress' || st === 'progress') statusClass = 'badge-inprogress';
        else if (st === 'on hold') statusClass = 'badge-pending';

        const actualDur = getCleanDuration(ticket);
        const slaDur = getCleanSlaDuration(ticket);
        const slaMin = parseDurationToMinutes(slaDur);
        const slaPill = slaMin <= 240
            ? `<span class="sla-pill met" title="SLA Met (≤ 4 Jam)"><i class="fa-solid fa-circle-check"></i> ${slaDur}</span>`
            : `<span class="sla-pill breach" title="SLA Breach (> 4 Jam)"><i class="fa-solid fa-triangle-exclamation"></i> ${slaDur}</span>`;

        const tr = document.createElement('tr');
        tr.className = 'exec-row-clickable';
        tr.innerHTML = `
            <td class="text-mono font-weight-bold" style="color: var(--accent-secondary);">${ticket["Ticket ID"] || '-'}</td>
            <td class="text-mono" style="font-size: 12px;">${formatDateTimeString(ticket["Start Time"])}</td>
            <td style="font-weight: 600; color: var(--text-primary);">${ticket["Customer Name"] || ticket["Vendor"] || '-'}</td>
            <td class="text-mono">${ticket["Service ID"] || ticket["Link / Device"] || '-'}</td>
            <td><span class="badge badge-subtle">${ticket["Service Type"] || ticket["Infra Category"] || '-'}</span></td>
            <td><span class="badge ${sevClass}">${ticket["Severity"] || '-'}</span></td>
            <td><span class="badge ${statusClass}">${ticket["Status"] || '-'}</span></td>
            <td class="text-mono" style="font-size: 12px;">${actualDur}</td>
            <td class="text-mono" style="font-size: 12px;">${slaPill}</td>
            <td style="font-size: 12px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ticket["Root Cause L1"] || ''}">${ticket["Root Cause L1"] || '-'}</td>
        `;

        tr.addEventListener('click', () => {
            state.tickets = state.execCorp.tickets;
            openDetailDrawer(ticket["Ticket ID"]);
        });

        elements.execCorpTicketsList.appendChild(tr);
    });
}

function bindExecCorpDashboardEvents() {
    if (elements.btnExecCorpApply) {
        elements.btnExecCorpApply.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.execCorpFilterStartDate && elements.execCorpFilterEndDate) {
                if (elements.execCorpFilterStartDate.value > elements.execCorpFilterEndDate.value) {
                    showToast("Start Date tidak boleh lebih besar dari End Date", "error");
                    return;
                }
                state.execCorp.startDate = elements.execCorpFilterStartDate.value;
                state.execCorp.endDate = elements.execCorpFilterEndDate.value;
            }
            updateExecCorpDashboard();
            showToast("Filter periode diterapkan", "success");
        });
    }

    if (elements.btnExecCorpReset) {
        elements.btnExecCorpReset.addEventListener('click', (e) => {
            e.preventDefault();
            state.execCorp.startDate = '';
            state.execCorp.endDate = '';
            setDefaultExecCorpDateRange();
            updateExecCorpDashboard();
            showToast("Periode dikembalikan ke default mingguan", "info");
        });
    }

    if (elements.execCorpTableSearch) {
        elements.execCorpTableSearch.addEventListener('input', (e) => {
            state.execCorp.searchQuery = e.target.value;
            state.execCorp.currentPage = 1;
            renderExecCorpDetailTable();
        });
    }

    if (elements.btnExecCorpPrev) {
        elements.btnExecCorpPrev.addEventListener('click', () => {
            if (state.execCorp.currentPage > 1) {
                state.execCorp.currentPage--;
                renderExecCorpDetailTable();
            }
        });
    }

    if (elements.btnExecCorpNext) {
        elements.btnExecCorpNext.addEventListener('click', () => {
            state.execCorp.currentPage++;
            renderExecCorpDetailTable();
        });
    }

    // Sort column headers
    document.querySelectorAll('#exec-corp-tickets-table th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-sort');
            if (state.execCorp.sortField === field) {
                state.execCorp.sortAsc = !state.execCorp.sortAsc;
            } else {
                state.execCorp.sortField = field;
                state.execCorp.sortAsc = field === 'Start Time' ? false : true;
            }
            document.querySelectorAll('#exec-corp-tickets-table th[data-sort] i').forEach(icon => {
                icon.className = 'fa-solid fa-sort';
            });
            const icon = th.querySelector('i');
            if (icon) {
                icon.className = state.execCorp.sortAsc ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
            }
            renderExecCorpDetailTable();
        });
    });
}

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    initTheme();
    if (localStorage.getItem('nexus_sidebar_collapsed') === 'true') {
        elements.appContainer.classList.add('sidebar-collapsed');
    }
    elements.configUrlInput.value = state.webAppUrl;
    updateConnectionBadge();
    preloadCustomers(); // Tarik data customer di awal secara asinkron
    bindExecDashboardEvents(); // Bind event listeners untuk Executive Dashboard Infra
    bindExecCorpDashboardEvents(); // Bind event listeners untuk Executive Dashboard Corp
    navigateTab('noc'); // Default landing page is Dashboard NOC
}

document.addEventListener('DOMContentLoaded', init);
init();

