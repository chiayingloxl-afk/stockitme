(function(){
  "use strict";

  var TASK_CATS = [["q1","第一季・年報籌備"],["q2","第二季・股東會"],["q3","第三季・股利發放"],["q4","第四季・年底結算"],["monthly","常態月例申報"],["other","其他"]];
  var TASK_CAT_MAP = {}; TASK_CATS.forEach(function(p){ TASK_CAT_MAP[p[0]] = p[1]; });
  var DOC_CATS = ["開會通知","議事手冊","委託書","議事錄","年報","公告文件","契約合規","其他"];
  var STATUS_LABEL = { todo:"待辦", in_progress:"進行中", done:"已完成" };
  var ICON_EDIT = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 16.5l1-3.6L13.5 4.4a1.5 1.5 0 0 1 2.1 0l0 0a1.5 1.5 0 0 1 0 2.1L7.1 15l-3.6 1z"/></svg>';
  var ICON_DELETE = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6M6 6l.6 10a1.5 1.5 0 0 0 1.5 1.4h3.8a1.5 1.5 0 0 0 1.5-1.4L14 6"/></svg>';

  var SEED_TASKS = [
    { id:"t1", title:"向集保申請股東持股分析報告", category:"q1", dueDate:"2026-01-20", status:"todo", notes:"確認大股東名單與外資比例", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t2", title:"董監事持股月申報", category:"monthly", dueDate:"2026-02-05", status:"todo", notes:"每月5日前向金管會證期局申報", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t3", title:"配合會計師提供股本明細", category:"q1", dueDate:"2026-02-15", status:"todo", notes:"含庫藏股、員工認股資料", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t4", title:"董事會決議股東常會日期", category:"q1", dueDate:"2026-03-10", status:"todo", notes:"確認日期、地點、議案", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t5", title:"公告停止過戶", category:"q1", dueDate:"2026-03-25", status:"todo", notes:"股東會前10日於MOPS公告", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t6", title:"寄發股東常會開會通知", category:"q2", dueDate:"2026-05-01", status:"todo", notes:"召開前30日寄發", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t7", title:"電子投票系統設定開通", category:"q2", dueDate:"2026-05-10", status:"todo", notes:"向集保申請e-Vote並設定議案", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t8", title:"委託書與出席卡收件彙整", category:"q2", dueDate:"2026-05-25", status:"todo", notes:"逐日確認授權有效性", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t9", title:"股東常會召開", category:"q2", dueDate:"2026-06-18", status:"todo", notes:"確認出席股數達法定門檻", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t10", title:"股東常會議事錄公告", category:"q2", dueDate:"2026-07-08", status:"todo", notes:"會後20日內完成並公告於MOPS", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t11", title:"公告除權息基準日", category:"q3", dueDate:"2026-07-25", status:"todo", notes:"配合集保時程向OTC申報", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t12", title:"現金股利匯款作業", category:"q3", dueDate:"2026-08-20", status:"todo", notes:"透過股務代理機構匯至股東集保帳戶", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t13", title:"扣繳憑單資料核對", category:"q3", dueDate:"2026-09-15", status:"todo", notes:"與財務部確認所得稅扣繳數字", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t14", title:"董監事任期確認與次年改選評估", category:"q4", dueDate:"2026-11-10", status:"todo", notes:"", createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"t15", title:"年度股務作業檢討會議", category:"q4", dueDate:"2026-12-15", status:"todo", notes:"彙整全年缺失與改善建議", createdAt:"2026-01-01T00:00:00.000Z" }
  ];
  var SEED_ANNOUNCEMENTS = [
    { id:"a1", title:"歡迎使用股務作業站", body:"這裡整合了全年度股務行事曆、股東會文件庫，以及公告發布功能。待辦事項可依季度分類、追蹤狀態與截止日；文件會依類別自動分組；公告可置頂顯示重要訊息。歡迎團隊成員開始使用並依實際狀況調整內容。", publishedAt:"2026-01-05T00:00:00.000Z", pinned:true, authorId:null },
    { id:"a2", title:"2026年度股東常會時程預告", body:"預計於6月中召開股東常會，相關前置作業（開會通知、委託書徵集、電子投票設定）已列入股務行事曆，請各負責同仁留意截止日期。", publishedAt:"2026-01-10T00:00:00.000Z", pinned:false, authorId:null }
  ];

  var LOCAL_KEY = "shareholder_ops_v1";
  var isLocalMode = false;
  var localState = null;
  function loadLocal(){
    try{
      var raw = localStorage.getItem(LOCAL_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    return null;
  }
  function saveLocal(){
    try{ localStorage.setItem(LOCAL_KEY, JSON.stringify(localState)); }catch(e){}
  }
  function ensureLocalState(){
    if(localState) return localState;
    var loaded = loadLocal();
    localState = loaded || { tasks: SEED_TASKS.slice(), documents: [], announcements: SEED_ANNOUNCEMENTS.slice() };
    if(!loaded) saveLocal();
    return localState;
  }
  function uid(){ return "l" + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  var db = null, assetsCap = null, userCap = null;
  var canWriteShared = true;
  var myId = null;
  var tasks = [], docsList = [], announcements = [];
  var profilesCache = {};
  var currentView = "dashboard";
  var calMonth = new Date(); calMonth.setDate(1);
  var selectedDate = null;
  var taskFilter = { status:"all", cat:"all" };

  var viewRoot = document.getElementById("view-root");
  var pageTitle = document.getElementById("page-title");

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }
  function fmtDate(iso){
    if(!iso) return "";
    var parts = iso.split("-");
    if(parts.length < 3) return iso;
    return parts[0] + "/" + parts[1] + "/" + parts[2];
  }
  function todayIso(){ return new Date().toISOString().slice(0,10); }
  function isOverdue(t){ return t.status !== "done" && t.dueDate && t.dueDate < todayIso(); }
  function fmtSize(n){
    if(n == null) return "";
    if(n < 1024) return n + " B";
    if(n < 1024*1024) return (n/1024).toFixed(1) + " KB";
    return (n/1024/1024).toFixed(1) + " MB";
  }

  function navigate(view){
    currentView = view;
    selectedDate = null;
    document.querySelectorAll(".nav-item").forEach(function(el){
      el.classList.toggle("active", el.dataset.view === view);
    });
    render();
  }

  function render(){
    if(currentView === "dashboard") renderDashboard();
    else if(currentView === "tasks") renderTasks();
    else if(currentView === "documents") renderDocuments();
    else if(currentView === "announcements") renderAnnouncements();
  }

  // ---------- dashboard ----------
  function renderDashboard(){
    pageTitle.textContent = "首頁總覽";
    var openTasks = tasks.filter(function(t){ return t.status !== "done"; });
    var overdue = tasks.filter(isOverdue);
    var upcoming = openTasks.filter(function(t){ return t.dueDate; })
      .sort(function(a,b){ return a.dueDate > b.dueDate ? 1 : -1; }).slice(0,6);
    var recentAnn = announcements.slice().sort(function(a,b){
      return (a.publishedAt||"") < (b.publishedAt||"") ? 1 : -1;
    }).slice(0,3);

    var html = "";
    html += '<div class="stat-grid">';
    html += '<div class="stat-tile"><span class="stat-num">' + openTasks.length + '</span><span class="stat-label">待辦事項</span></div>';
    html += '<div class="stat-tile' + (overdue.length ? ' stat-bad' : '') + '"><span class="stat-num">' + overdue.length + '</span><span class="stat-label">逾期項目</span></div>';
    html += '<div class="stat-tile"><span class="stat-num">' + docsList.length + '</span><span class="stat-label">文件庫存</span></div>';
    html += '<div class="stat-tile"><span class="stat-num">' + announcements.length + '</span><span class="stat-label">公告則數</span></div>';
    html += '</div>';

    html += '<div class="dash-grid">';
    html += '<div class="panel"><div class="panel-head"><h2>近期待辦</h2><button class="link-btn" data-action="goto" data-view="tasks" type="button">查看全部 →</button></div>';
    if(upcoming.length){
      html += '<ul class="mini-list">' + upcoming.map(function(t){
        return '<li class="' + (isOverdue(t) ? 'is-overdue' : '') + '"><span class="badge badge-' + t.status + '">' + STATUS_LABEL[t.status] + '</span><span class="mini-title">' + esc(t.title) + '</span><span class="mini-date">' + fmtDate(t.dueDate) + '</span></li>';
      }).join('') + '</ul>';
    } else {
      html += '<p class="empty-note">目前沒有待辦事項。</p>';
    }
    html += '</div>';

    html += '<div class="panel"><div class="panel-head"><h2>最新公告</h2><button class="link-btn" data-action="goto" data-view="announcements" type="button">查看全部 →</button></div>';
    if(recentAnn.length){
      html += '<ul class="mini-list">' + recentAnn.map(function(a){
        return '<li>' + (a.pinned ? '<span class="pin-mark">置頂</span>' : '') + '<span class="mini-title">' + esc(a.title) + '</span><span class="mini-date">' + fmtDate((a.publishedAt||"").slice(0,10)) + '</span></li>';
      }).join('') + '</ul>';
    } else {
      html += '<p class="empty-note">尚無公告。</p>';
    }
    html += '</div>';

    html += '<div class="panel panel-wide"><div class="panel-head"><h2>年度股務重點提醒</h2></div><div class="quarter-ref">';
    html += '<div><h3>Q1・1-3月</h3><p>股東名簿與董監持股盤點、配合財報作業、規劃停止過戶日期。</p></div>';
    html += '<div><h3>Q2・4-6月</h3><p>寄發開會通知、委託書與電子投票作業、召開股東常會並公告議事錄。</p></div>';
    html += '<div><h3>Q3・7-9月</h3><p>公告除權息基準日、計算並匯發股利、核對扣繳憑單資料。</p></div>';
    html += '<div><h3>Q4・10-12月</h3><p>年度股務作業檢討、確認董監任期、預備次年股東會時程與年報資料。</p></div>';
    html += '</div></div>';
    html += '</div>';

    viewRoot.innerHTML = html;
  }

  // ---------- tasks / calendar ----------
  function renderTasks(){
    pageTitle.textContent = "股務行事曆・待辦追蹤";
    var y = calMonth.getFullYear(), m = calMonth.getMonth();
    var first = new Date(y, m, 1);
    var startWeekday = first.getDay();
    var daysInMonth = new Date(y, m+1, 0).getDate();
    var today = todayIso();

    var cells = "";
    for(var i=0;i<startWeekday;i++) cells += '<div class="cal-cell cal-empty"></div>';
    for(var d=1; d<=daysInMonth; d++){
      var iso = y + "-" + String(m+1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
      var dayTasks = tasks.filter(function(t){ return t.dueDate === iso; });
      var overdueHere = dayTasks.some(isOverdue);
      cells += '<button type="button" class="cal-cell ' + (iso===today?'cal-today':'') + ' ' + (iso===selectedDate?'cal-selected':'') + '" data-action="calendar-day" data-date="' + iso + '">' +
        '<span class="cal-daynum ' + (overdueHere?'cal-daynum-bad':'') + '">' + d + '</span>' +
        (dayTasks.length ? '<span class="cal-dots">' + dayTasks.slice(0,4).map(function(t){ return '<i class="dot dot-' + t.status + '"></i>'; }).join('') + '</span>' : '') +
        '</button>';
    }

    var filtered = tasks.filter(function(t){
      var statusOk = taskFilter.status === "all" || t.status === taskFilter.status || (taskFilter.status === "overdue" && isOverdue(t));
      var catOk = taskFilter.cat === "all" || t.category === taskFilter.cat;
      var dateOk = !selectedDate || t.dueDate === selectedDate;
      return statusOk && catOk && dateOk;
    }).sort(function(a,b){
      var da = a.dueDate || "9999-99", db_ = b.dueDate || "9999-99";
      return da > db_ ? 1 : -1;
    });

    var groups = {}, groupKeys = [];
    filtered.forEach(function(t){
      var key = t.dueDate ? t.dueDate.slice(0,7) : "未排定";
      if(!groups[key]){ groups[key] = []; groupKeys.push(key); }
      groups[key].push(t);
    });
    groupKeys.sort();

    var html = "";
    html += '<div class="toolbar">';
    if(canWriteShared) html += '<button class="btn-primary" data-action="open-task-form" type="button">＋ 新增待辦</button>';
    html += '<select class="filter-select" data-filter="status">' +
      '<option value="all">全部狀態</option><option value="todo">待辦</option><option value="in_progress">進行中</option><option value="done">已完成</option><option value="overdue">逾期</option></select>';
    html += '<select class="filter-select" data-filter="cat"><option value="all">全部分類</option>' + TASK_CATS.map(function(p){ return '<option value="' + p[0] + '">' + esc(p[1]) + '</option>'; }).join('') + '</select>';
    if(selectedDate) html += '<button class="chip-clear" data-action="clear-date-filter" type="button">清除日期篩選（' + fmtDate(selectedDate) + '）✕</button>';
    html += '</div>';

    html += '<div class="calendar"><div class="cal-head"><button class="cal-nav" data-action="calendar-prev" type="button" aria-label="上個月">‹</button><h2>' + y + '年' + (m+1) + '月</h2><button class="cal-nav" data-action="calendar-next" type="button" aria-label="下個月">›</button></div>';
    html += '<div class="cal-weekdays">' + ["日","一","二","三","四","五","六"].map(function(w){ return '<span>'+w+'</span>'; }).join('') + '</div>';
    html += '<div class="cal-grid">' + cells + '</div></div>';

    html += '<div class="task-groups">';
    if(groupKeys.length){
      groupKeys.forEach(function(k){
        var label;
        if(k === "未排定") label = "未排定日期";
        else { var kp = k.split("-"); label = kp[0] + "年" + parseInt(kp[1],10) + "月"; }
        html += '<div class="task-group"><h3 class="task-group-title">' + label + '</h3><div class="task-list">';
        html += groups[k].map(taskRowHtml).join('');
        html += '</div></div>';
      });
    } else {
      html += '<p class="empty-note">沒有符合條件的待辦事項。</p>';
    }
    html += '</div>';

    viewRoot.innerHTML = html;
    var sSel = viewRoot.querySelector('[data-filter="status"]'); if(sSel) sSel.value = taskFilter.status;
    var cSel = viewRoot.querySelector('[data-filter="cat"]'); if(cSel) cSel.value = taskFilter.cat;
  }

  function taskRowHtml(t){
    var overdue = isOverdue(t);
    return '<div class="task-row ' + (overdue?'is-overdue':'') + '">' +
      '<select class="status-select status-' + t.status + '" data-action="set-status" data-id="' + t.id + '" ' + (canWriteShared?'':'disabled') + '>' +
        '<option value="todo"' + (t.status==='todo'?' selected':'') + '>待辦</option>' +
        '<option value="in_progress"' + (t.status==='in_progress'?' selected':'') + '>進行中</option>' +
        '<option value="done"' + (t.status==='done'?' selected':'') + '>已完成</option>' +
      '</select>' +
      '<div class="task-info"><span class="task-title">' + esc(t.title) + '</span><span class="task-meta">' + esc(TASK_CAT_MAP[t.category]||'其他') + (t.notes ? ' · ' + esc(t.notes) : '') + '</span></div>' +
      '<span class="task-due ' + (overdue?'text-bad':'') + '">' + (t.dueDate ? fmtDate(t.dueDate) + (overdue?'（逾期）':'') : '未排定') + '</span>' +
      (canWriteShared ? '<div class="row-actions"><button class="icon-btn" data-action="edit-task" data-id="' + t.id + '" type="button" title="編輯">' + ICON_EDIT + '</button><button class="icon-btn" data-action="delete-task" data-id="' + t.id + '" type="button" title="刪除">' + ICON_DELETE + '</button></div>' : '<div class="row-actions"></div>') +
    '</div>';
  }

  // ---------- documents ----------
  function renderDocuments(){
    pageTitle.textContent = "股東會・文件管理";
    var groups = {};
    DOC_CATS.forEach(function(c){ groups[c] = []; });
    docsList.forEach(function(d){
      var cat = d.category || "其他";
      if(!groups[cat]) groups[cat] = [];
      groups[cat].push(d);
    });
    var allCats = DOC_CATS.slice();
    Object.keys(groups).forEach(function(c){ if(allCats.indexOf(c) === -1) allCats.push(c); });

    var canUploadDocs = isLocalMode || !!assetsCap;
    var html = '<div class="toolbar">';
    if(canUploadDocs) html += '<button class="btn-primary" data-action="open-doc-upload" type="button">＋ 上傳文件</button>';
    else html += '<p class="empty-note">目前帳號僅能檢視文件，無法上傳或刪除。</p>';
    html += '</div><div class="doc-groups">';

    var any = false;
    allCats.forEach(function(cat){
      var items = (groups[cat] || []).slice().sort(function(a,b){ return (a.uploadedAt||"") < (b.uploadedAt||"") ? 1 : -1; });
      if(!items.length) return;
      any = true;
      html += '<details class="doc-group" open><summary>' + esc(cat) + ' <span class="count-badge">' + items.length + '</span></summary><div class="doc-table">';
      items.forEach(function(d){
        var href = d.dataUrl ? d.dataUrl : (d.assetId ? ('/_blob/' + esc(d.assetId)) : '');
        html += '<div class="doc-row">' +
          (href ? '<a class="doc-name" href="' + href + '" target="_blank" rel="noopener">' + esc(d.name) + '</a>' : '<span class="doc-name" style="color:var(--ink-3);">' + esc(d.name) + '</span>') +
          '<span class="doc-meta">' + fmtSize(d.sizeBytes) + '</span>' +
          '<span class="doc-meta">' + fmtDate((d.uploadedAt||"").slice(0,10)) + '</span>' +
          (canUploadDocs ? '<button class="icon-btn" data-action="delete-doc" data-id="' + d.id + '" type="button" title="刪除">' + ICON_DELETE + '</button>' : '') +
          (d.note ? '<span class="doc-note">' + esc(d.note) + '</span>' : '') +
        '</div>';
      });
      html += '</div></details>';
    });
    if(!any) html += '<p class="empty-note">尚未上傳任何文件。</p>';
    html += '</div>';
    viewRoot.innerHTML = html;
  }

  // ---------- announcements ----------
  function renderAnnouncements(){
    pageTitle.textContent = "公告與最新消息";
    var sorted = announcements.slice().sort(function(a,b){
      var ap = !!a.pinned, bp = !!b.pinned;
      if(ap !== bp) return ap ? -1 : 1;
      return (a.publishedAt||"") < (b.publishedAt||"") ? 1 : -1;
    });
    var ids = [];
    sorted.forEach(function(a){ if(a.authorId && ids.indexOf(a.authorId) === -1) ids.push(a.authorId); });

    function paint(){
      var html = '<div class="toolbar">';
      if(canWriteShared) html += '<button class="btn-primary" data-action="open-announcement-form" type="button">＋ 發布公告</button>';
      html += '</div><div class="ann-list">';
      if(sorted.length){
        sorted.forEach(function(a){
          var author = profilesCache[a.authorId];
          var authorName = (author && author.name) ? author.name : "股務團隊";
          html += '<article class="ann-card ' + (a.pinned?'ann-pinned':'') + '">' +
            '<div class="ann-head">' + (a.pinned ? '<span class="pin-mark">置頂</span>' : '') + '<h3>' + esc(a.title) + '</h3></div>' +
            '<p class="ann-body">' + esc(a.body) + '</p>' +
            '<div class="ann-meta"><span>' + esc(authorName) + '</span><span>' + fmtDate((a.publishedAt||"").slice(0,10)) + '</span>' +
            (canWriteShared ? '<span class="ann-actions"><button class="link-btn" data-action="toggle-pin" data-id="' + a.id + '" type="button">' + (a.pinned?'取消置頂':'置頂') + '</button><button class="link-btn" data-action="edit-announcement" data-id="' + a.id + '" type="button">編輯</button><button class="link-btn" data-action="delete-announcement" data-id="' + a.id + '" type="button">刪除</button></span>' : '') +
            '</div></article>';
        });
      } else {
        html += '<p class="empty-note">尚無公告，點擊上方按鈕發布第一則。</p>';
      }
      html += '</div>';
      viewRoot.innerHTML = html;
    }

    if(ids.length && userCap){
      resolveNames(ids).then(paint);
    } else {
      paint();
    }
  }

  function resolveNames(ids){
    var need = ids.filter(function(id){ return id && !profilesCache[id]; });
    if(!need.length || !userCap) return Promise.resolve(profilesCache);
    return userCap.profiles(need).then(function(res){
      Object.assign(profilesCache, res);
      return profilesCache;
    }).catch(function(){ return profilesCache; });
  }

  // ---------- mutations ----------
  function requireDb(){
    if(!db){ alert("尚未連線至資料服務，請重新整理頁面後再試一次。"); return false; }
    return true;
  }

  function saveTask(data, id){
    if(isLocalMode){
      if(id){
        var t = tasks.filter(function(x){ return x.id === id; })[0];
        if(t) Object.assign(t, data);
      } else {
        tasks.push(Object.assign({ id: uid(), createdAt: new Date().toISOString(), authorId: null }, data));
      }
      saveLocal(); render();
      return Promise.resolve();
    }
    if(!requireDb()) return Promise.resolve();
    var p = id ? db.collection("tasks").doc(id).update(data)
               : db.collection("tasks").add(Object.assign({}, data, { createdAt: new Date().toISOString(), authorId: myId }));
    return p.catch(function(err){ alert("儲存失敗：" + (err && err.message ? err.message : err)); });
  }
  function deleteTask(id){
    if(!confirm("確定要刪除這項待辦事項嗎？")) return;
    if(isLocalMode){
      var idx = tasks.findIndex(function(x){ return x.id === id; });
      if(idx > -1) tasks.splice(idx,1);
      saveLocal(); render();
      return;
    }
    if(!requireDb()) return;
    db.collection("tasks").doc(id).delete().catch(function(){ alert("刪除失敗。"); });
  }
  function updateTaskStatus(id, status){
    if(isLocalMode){
      var t = tasks.filter(function(x){ return x.id === id; })[0];
      if(t){ t.status = status; saveLocal(); render(); }
      return;
    }
    if(!requireDb()) return;
    db.collection("tasks").doc(id).update({ status: status }).catch(function(){ alert("更新失敗。"); });
  }

  function handleUpload(files, category, note){
    if(isLocalMode){
      var maxInline = 4 * 1024 * 1024;
      files.forEach(function(file){
        if(file.size <= maxInline){
          var reader = new FileReader();
          reader.onload = function(){
            docsList.push({ id: uid(), name: file.name, category: category, note: note || "", sizeBytes: file.size, contentType: file.type || "application/octet-stream", uploadedAt: new Date().toISOString(), authorId: null, dataUrl: reader.result });
            saveLocal(); render();
          };
          reader.readAsDataURL(file);
        } else {
          docsList.push({ id: uid(), name: file.name, category: category, note: (note ? note + "　" : "") + "（檔案超過4MB，本機模式僅保留檔名資訊）", sizeBytes: file.size, contentType: file.type || "application/octet-stream", uploadedAt: new Date().toISOString(), authorId: null, dataUrl: null });
          saveLocal(); render();
        }
      });
      return;
    }
    if(!assetsCap){ alert("目前帳號沒有上傳文件的權限。"); return; }
    if(!requireDb()) return;
    files.forEach(function(file){
      assetsCap.upload(file).then(function(res){
        return db.collection("documents").add({
          name: file.name, category: category, note: note || "",
          assetId: res.id, sizeBytes: res.sizeBytes, contentType: res.contentType,
          uploadedAt: new Date().toISOString(), authorId: myId
        });
      }).catch(function(err){
        alert('上傳「' + file.name + '」失敗：' + (err && err.message ? err.message : err));
      });
    });
  }
  function deleteDoc(id){
    var d = docsList.filter(function(x){ return x.id === id; })[0];
    if(!d) return;
    if(!confirm('確定要刪除「' + d.name + '」嗎？此操作無法復原。')) return;
    if(isLocalMode){
      var idx = docsList.findIndex(function(x){ return x.id === id; });
      if(idx > -1) docsList.splice(idx,1);
      saveLocal(); render();
      return;
    }
    if(!requireDb()) return;
    var chain = Promise.resolve();
    if(assetsCap && d.assetId) chain = assetsCap.delete(d.assetId).catch(function(){});
    chain.then(function(){ return db.collection("documents").doc(id).delete(); })
      .catch(function(){ alert("刪除失敗。"); });
  }

  function saveAnnouncement(data, id){
    if(isLocalMode){
      if(id){
        var a = announcements.filter(function(x){ return x.id === id; })[0];
        if(a) Object.assign(a, data);
      } else {
        announcements.push(Object.assign({ id: uid(), publishedAt: new Date().toISOString(), authorId: null }, data, { pinned: !!data.pinned }));
      }
      saveLocal(); render();
      return Promise.resolve();
    }
    if(!requireDb()) return Promise.resolve();
    var p = id ? db.collection("announcements").doc(id).update(data)
               : db.collection("announcements").add(Object.assign({}, data, { publishedAt: new Date().toISOString(), authorId: myId, pinned: !!data.pinned }));
    return p.catch(function(err){ alert("儲存失敗：" + (err && err.message ? err.message : err)); });
  }
  function deleteAnnouncement(id){
    if(!confirm("確定要刪除這則公告嗎？")) return;
    if(isLocalMode){
      var idx = announcements.findIndex(function(x){ return x.id === id; });
      if(idx > -1) announcements.splice(idx,1);
      saveLocal(); render();
      return;
    }
    if(!requireDb()) return;
    db.collection("announcements").doc(id).delete().catch(function(){ alert("刪除失敗。"); });
  }
  function togglePin(id){
    var a = announcements.filter(function(x){ return x.id === id; })[0];
    if(!a) return;
    if(isLocalMode){
      a.pinned = !a.pinned;
      saveLocal(); render();
      return;
    }
    if(!requireDb()) return;
    db.collection("announcements").doc(id).update({ pinned: !a.pinned }).catch(function(){});
  }

  // ---------- dialogs ----------
  function openTaskForm(task){
    var dlg = document.getElementById("task-dialog");
    document.getElementById("task-dialog-title").textContent = task ? "編輯待辦事項" : "新增待辦事項";
    document.getElementById("task-title").value = task ? task.title || "" : "";
    document.getElementById("task-cat").value = task ? (task.category || "other") : "other";
    document.getElementById("task-due").value = task ? (task.dueDate || "") : "";
    document.getElementById("task-status").value = task ? (task.status || "todo") : "todo";
    document.getElementById("task-notes").value = task ? (task.notes || "") : "";
    dlg.dataset.editId = task ? task.id : "";
    dlg.showModal();
  }
  function openDocUpload(){
    document.getElementById("doc-files").value = "";
    document.getElementById("doc-note").value = "";
    document.getElementById("doc-dialog").showModal();
  }
  function openAnnouncementForm(a){
    var dlg = document.getElementById("announcement-dialog");
    document.getElementById("announcement-dialog-title").textContent = a ? "編輯公告" : "發布公告";
    document.getElementById("ann-title").value = a ? a.title || "" : "";
    document.getElementById("ann-body").value = a ? a.body || "" : "";
    document.getElementById("ann-pinned").checked = !!(a && a.pinned);
    dlg.dataset.editId = a ? a.id : "";
    dlg.showModal();
  }

  // ---------- event wiring ----------
  function findTask(id){ return tasks.filter(function(t){ return t.id === id; })[0]; }
  function findAnnouncement(id){ return announcements.filter(function(a){ return a.id === id; })[0]; }

  viewRoot.addEventListener("click", function(e){
    var btn = e.target.closest("[data-action]");
    if(!btn) return;
    var action = btn.dataset.action, id = btn.dataset.id;
    if(action === "open-task-form") openTaskForm(null);
    else if(action === "edit-task") openTaskForm(findTask(id));
    else if(action === "delete-task") deleteTask(id);
    else if(action === "calendar-prev"){ calMonth.setMonth(calMonth.getMonth()-1); renderTasks(); }
    else if(action === "calendar-next"){ calMonth.setMonth(calMonth.getMonth()+1); renderTasks(); }
    else if(action === "calendar-day"){ selectedDate = (selectedDate === btn.dataset.date) ? null : btn.dataset.date; renderTasks(); }
    else if(action === "clear-date-filter"){ selectedDate = null; renderTasks(); }
    else if(action === "open-doc-upload") openDocUpload();
    else if(action === "delete-doc") deleteDoc(id);
    else if(action === "open-announcement-form") openAnnouncementForm(null);
    else if(action === "edit-announcement") openAnnouncementForm(findAnnouncement(id));
    else if(action === "delete-announcement") deleteAnnouncement(id);
    else if(action === "toggle-pin") togglePin(id);
    else if(action === "goto") navigate(btn.dataset.view);
  });

  viewRoot.addEventListener("change", function(e){
    var sel = e.target.closest('[data-action="set-status"]');
    if(sel){ updateTaskStatus(sel.dataset.id, sel.value); return; }
    var f = e.target.closest("[data-filter]");
    if(f){ taskFilter[f.dataset.filter] = f.value; renderTasks(); }
  });

  document.querySelector(".sidebar").addEventListener("click", function(e){
    var item = e.target.closest(".nav-item");
    if(item) navigate(item.dataset.view);
  });

  document.addEventListener("click", function(e){
    var btn = e.target.closest('[data-action="close-dialog"]');
    if(btn) document.getElementById(btn.dataset.dialog).close();
  });
  document.querySelectorAll("dialog").forEach(function(dlg){
    dlg.addEventListener("click", function(e){ if(e.target === dlg) dlg.close(); });
  });

  document.getElementById("task-form").addEventListener("submit", function(e){
    e.preventDefault();
    var dlg = document.getElementById("task-dialog");
    var data = {
      title: document.getElementById("task-title").value.trim(),
      category: document.getElementById("task-cat").value,
      dueDate: document.getElementById("task-due").value || null,
      status: document.getElementById("task-status").value,
      notes: document.getElementById("task-notes").value.trim()
    };
    if(!data.title) return;
    var editId = dlg.dataset.editId || null;
    dlg.close();
    saveTask(data, editId);
  });

  document.getElementById("doc-form").addEventListener("submit", function(e){
    e.preventDefault();
    var dlg = document.getElementById("doc-dialog");
    var filesInput = document.getElementById("doc-files");
    var files = Array.prototype.slice.call(filesInput.files);
    var category = document.getElementById("doc-cat").value;
    var note = document.getElementById("doc-note").value.trim();
    if(!files.length) return;
    dlg.close();
    handleUpload(files, category, note);
  });

  document.getElementById("announcement-form").addEventListener("submit", function(e){
    e.preventDefault();
    var dlg = document.getElementById("announcement-dialog");
    var data = {
      title: document.getElementById("ann-title").value.trim(),
      body: document.getElementById("ann-body").value.trim(),
      pinned: document.getElementById("ann-pinned").checked
    };
    if(!data.title || !data.body) return;
    var editId = dlg.dataset.editId || null;
    dlg.close();
    saveAnnouncement(data, editId);
  });

  // ---------- boot ----------
  function bootLocal(){
    isLocalMode = true;
    canWriteShared = true;
    assetsCap = null;
    ensureLocalState();
    tasks = localState.tasks;
    docsList = localState.documents;
    announcements = localState.announcements;
    var greet = document.getElementById("greeting");
    if(greet) greet.textContent = "哈囉（本機模式）";
    var foot = document.querySelector(".sidebar-foot");
    if(foot) foot.innerHTML = "本機獨立模式<br>資料僅保存在此瀏覽器（localStorage）";
    render();
  }

  function subscribe(){
    db.collection("tasks").onSnapshot(function(snap){
      tasks = snap.docs.map(function(d){ return Object.assign({ id: d.id }, d.data()); });
      render();
    }, function(err){ console.error("tasks snapshot", err); });

    db.collection("documents").onSnapshot(function(snap){
      docsList = snap.docs.map(function(d){ return Object.assign({ id: d.id }, d.data()); });
      render();
    }, function(err){ console.error("documents snapshot", err); });

    db.collection("announcements").onSnapshot(function(snap){
      announcements = snap.docs.map(function(d){ return Object.assign({ id: d.id }, d.data()); });
      render();
    }, function(err){ console.error("announcements snapshot", err); });
  }

  function boot(){
    if(!window.claude || !window.claude.use){ bootLocal(); return; }
    window.claude.use("db").then(function(dbCap){
      db = dbCap;
      if(!db){ bootLocal(); return; }
      return Promise.all([
        window.claude.use("assets").then(function(c){ assetsCap = c; }),
        window.claude.use("user").then(function(c){
          userCap = c;
          if(!userCap) return;
          return Promise.all([
            userCap.id().then(function(id){ myId = id; }),
            userCap.can("data.write").then(function(w){ canWriteShared = (w === false) ? false : true; }),
            userCap.me().then(function(me){
              var el = document.getElementById("greeting");
              el.textContent = me.name ? ("哈囉，" + me.name) : "哈囉";
            })
          ]);
        })
      ]).then(function(){
        subscribe();
        render();
      });
    }).catch(function(err){ console.error("boot failed", err); bootLocal(); });
  }

  navigate("dashboard");
  boot();
})();
