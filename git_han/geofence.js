$(document).ready(function() {
	$.validator.addMethod("regex", function(value, element, regexpr) {     
	    return regexpr.test(value.replace(/\s/g, ''));
	}, "Please enter a valid value.");

	$.validator.addMethod("unlocode", function(value, element, selector) {
		return $(selector).is(':checked');
	}, "Invalid UNLocode.");

	$.validator.addMethod("cntCdMatch", function(value, element, selector) {
		let _portCd = $(selector).val();
		let _cntCd = !_isNull(_portCd) ? _portCd.substring(0, 2): '';
		return _isNull(value) || _cntCd === value.substring(0, 2);
	}, "Please enter ports from the same country.");

	/** Port 등록/수정 시 validation 확인 & 저장 */
	$("#portFrm").validate({
		rules: {
			iptPortCd: {
				required: true,
				regex: /^[A-Z0-9]+$/,
			},
			selPortGeoType: {
				required: true,
			},
			iptPortGeoData: {
				required: true,
				regex: /{"type":"FeatureCollection","features":\[{"type":"Feature",(?:"geometry":{"type":"\S*","coordinates":\S*}|"properties":{\S*}),(?:"properties":{\S*}|"geometry":{"type":"\S*","coordinates":\S*})}\]}/,
			},
			iptUnlocode: {
				required: false,
				rangelength: [5, 5],
				unlocode: "#isValidPortCd",
				cntCdMatch: "#iptPortCd"
			},
			iptPortLat: {
				required: true,
			},
			iptPortLon: {
				required: true,
			}
		},
		messages: {
			iptPortCd: {
				required: "Please enter a port code.",
				regex: "Port code must be in uppercase letters only.",
			},
			selPortGeoType: {
				required: "Please select a port type.",
			},
			iptPortGeoData: {
				required: "Please enter a geofence data.",
				regex: "Please enter a valid geofence data.",
			},
			iptUnlocode: {
				rangelength: "Please enter only 5 letters."
			},
			iptPortLat: {
				required: "Please enter a latitude.",
			},
			iptPortLon: {
				required: "Please enter a longitude.",
			},
		},
		submitHandler: function (form) {
			Geofence.updatePort();
		},
	});

	/** Location 등록/수정 시 validation 확인 & 저장 */
	$("#locFrm").validate({
		rules: {
			iptLocNm: {
				required: true,
				rangelength: [1, 200],
			},
			selAreaKind: {
				required: true,
			},
			iptLocGeoData: {
				regex: /{"type":"FeatureCollection","features":\[{"type":"Feature",(?:"geometry":{"type":"\S*","coordinates":\S*}|"properties":{\S*}),(?:"properties":{\S*}|"geometry":{"type":"\S*","coordinates":\S*})}\]}/,
			},
		},
		messages: {
			iptLocNm: {
				required: "Please enter your location name.",
				rangelength: "The Location name can range from {0} to {1} characters.",
			},
			selAreaKind: {
				required: "Please select a area kind.",
			},
			iptLocGeoData: {
				regex: "Please enter a valid geofence data.",
			},
		},
		submitHandler: function (form) {
			Geofence.updateLoc()
		},
		selAreaKind: {
			required: "Please select a area kind.",
		},
		iptLocGeoData: {
			regex: "Please enter a valid geofence data.",
		},
	});

	$("#repLocFrm").validate({
		rules: {
			iptLocNm: {
				required: true,
				rangelength: [1, 200],
			},
			selRepAreaKind: {
				required: true,
			},
			iptRepLocGeoData: {
				regex: /{"type":"FeatureCollection","features":\[{"type":"Feature",(?:"geometry":{"type":"\S*","coordinates":\S*}|"properties":{\S*}),(?:"properties":{\S*}|"geometry":{"type":"\S*","coordinates":\S*})}\]}/,
			},
		},
		messages: {
			iptLocNm: {
				required: "Please enter your location name.",
				rangelength: "The Location name can range from {0} to {1} characters.",
			},
			selRepAreaKind: {
				required: "Please select a area kind.",
			},
			iptLocGeoData: {
				regex: "Please enter a valid geofence data.",
			},
		},
		submitHandler: function (form) {
			Geofence.updateRepLoc()
		},
		selRepAreaKind: {
			required: "Please select a area kind.",
		},
		iptLocGeoData: {
			regex: "Please enter a valid geofence data.",
		},
	});

	/** Rep. Port 등록/수정 시 validation 확인 & 저장 */
	$("#repFrm").validate({
		rules: {
			iptRepPortCd: {
				required: true,
				regex: /^[A-Z0-9]+$/,
			},
		},
		messages: {
			iptRepPortCd: {
				required: "Please enter a port code.",
			},
		},
		submitHandler: function (form) {
			Geofence.updateRepPort()
		},
	});
 });

let Geofence = {
	init: function(){
		this.config()
	},
	config: function(){
		let _t = this;

		_t.initGrid();
		_t.getRepPortList();
		_t.setModal("#copyModal");
		_t.setModal("#moveModal");
		
		/** copyModal 열릴 때 그리드 업데이트 */
		$('#copyModal').on('shown.bs.modal', function () {
			_t.getModalGridForCopyGeo().reloadGrid();
			_t.getModalGridForCopyGeo().refresh();
		});

		/** moveModal 열릴 때 그리드 업데이트 */
		$('#moveModal').on('shown.bs.modal', function () {
			_t.getModalGridForMoveGeo().reloadGrid();
			_t.getModalGridForMoveGeo().refresh();
		});

		/** 조회 이벤트 */
		$('#srchPortBtn').bind('click', ()=>{ _t.searchPort() });
		$('#mSrchCopyPortBtn').bind('click', ()=>{ _t.searchCopyModalPort() });
		$('#mSrchMovePortBtn').bind('click', ()=>{ _t.searchMoveModalPort() });
		$("#srchRepPortBtn").bind("click", ()=>{ _t.searchRep() });
		$('#srchLocBtn').bind('click', ()=>{ _t.searchLoc() });
		
		$("#btnAddPort").bind("click", ()=>{ _t.goPortAdd() })
		$("#btnAddRepPort").bind("click", ()=>{ _t.goRepPortAdd() })
		$("#btnAddLocGeo").bind("click", ()=>{ _t.goLocAdd() });
		$("#btnDelCheckLocGeo").bind("click", ()=>{ _t.deleteLoc() });
		$("#btnCopyCheckLocGeo").bind("click", ()=>{ _t.copyLoc() });

		$("#btnPortGeoData").bind("click", ()=>{ _t.drawGeoData('#iptPortGeoData', 'PORT'); });
		$("#btnLocGeoData").bind("click", ()=>{ _t.drawGeoData('#iptLocGeoData', 'LOCATION'); });
		$("#btnRepData").bind("click", ()=>{ _t.drawGeoData('#iptRepData', 'REP_PORT'); });
		
		$("button[name=btnMoveList]").bind("click", ()=> { _t.goPortList() });
		$("button[name=btnMoveListForLoc]").bind("click", ()=> { _t.goLocList() })
		
		$("#btnResetPortGeo").bind("click", ()=> { _t.resetPortProc() });
		$("#btnResetLocGeo").bind("click", ()=> { _t.resetLocProc() });
		$("#btnResetRep").bind("click", ()=> { _t.resetRepPortProc() });
		$('#btnDelLocGeo').bind('click', ()=>{ _t.deleteLoc(); });

		$('#btnCopyLocGeo').bind('click', ()=>{ _t.copyLoc(); });
		$('#btnCopyToOtherPort').bind('click', ()=>{ _t.copyLoc() });
		$('#btnMoveToOtherPort').bind('click', ()=>{ _t.moveLoc() });
		
		$('#selGeoTypeCd').bind('change', _t.checkTypeCd);
		$('#iptRadius').bind('change',_t.chagneRadiusData);
		$('#iptLocGeoData').bind('change',_t.chagneGeoData);
		
		/** 수정 화면에서 Geo Double 클릭 시, map에 그리기 */
		$("#iptPortGeoData").bind("dblclick", ()=>{ _t.redrawGeoData('#iptPortGeoData', 'PORT'); });
		$("#iptRepData").bind("dblclick", ()=>{ _t.redrawGeoData('#iptRepData', 'PORT'); });
		$("#iptLocGeoData").bind("dblclick", ()=>{_t.redrawGeoData('#iptLocGeoData', 'LOCATION'); });

		/** CSV 다운로드 */
		$('#btnPortExport').bind('click', ()=> { _t.exportPortGrid() });    
		$('.btnLocExport').bind('click', ()=> { _t.exportLocGrid() });  
		
		$("#btnCopyModal").bind("click", () => {_t.showModal("#copyModal");});
		$("#btnMoveModal").bind("click", () => {_t.showModal("#moveModal");});

		//hanmin > rep 버튼 처리
		$("#btnMenuPortGeo").bind("click", ()=>{ _t.goPortMenu() });
		$("#btnMenuRepPort").bind("click", ()=>{ _t.goRepPortMenu() });
		$("#btnAddRepLocGeo").bind("click", ()=>{ _t.goRepLocAdd() });
		$("#btnCopyCheckRepLocGeo").bind("click", ()=>{ _t.copyRepLoc() });
		$("#btnDelCheckRepLocGeo").bind("click", ()=>{ _t.deleteRecLoc() });
		$("#btnRepLocGeoData").bind("click", ()=>{ _t.drawRepGeoData('#iptRepLocGeoData', 'REP_LOCATION'); });
		$("button[name=btnRepMoveList]").bind("click", ()=> { _t.goRepList() });
		$("button[name=btnMoveListForRepLoc]").bind("click", ()=> { _t.goRepLocList() })
		$("#iptRepLocGeoData").bind("dblclick", ()=>{_t.redrawGeoData('#iptRepLocGeoData', 'REP_LOCATION'); });
		$('#btnRepPortExport').bind('click', ()=> { _t.exportRepPortGrid() }); 
		$('#btnDelRepLocGeo').bind('click', ()=>{ _t.deleteRepLoc(); });
		$('#btnCopyRepLocGeo').bind('click', ()=>{ _t.copyRepLoc(); });
		$("#btnRepCopyModal").bind("click", () => {_t.showRepModal("#copyModal");});
		$("#btnRepMoveModal").bind("click", () => {_t.showRepModal("#moveModal");});
		/**
		 * input 엔터 키 이벤트
		 */
		$("input.search").bind("keydown", (e) => {
			if(e.key == 'Enter') {
			  ($(e.target).next()).trigger("click");
			}
		})

	  
		$("input.uppercase").bind("keyup", (e) => {
			let kr_regex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
	  
			let $input = $(e.target);
	  
			if (kr_regex.test($input.val())) {
			  $input.val("");
			} else {
			  $input.val($input.val().toUpperCase());
			}
		});

		Util.portInputValidation('#iptUnlocode');
		Util.portAutoComplete('#iptUnlocode', "#isValidPortCd");
	},
	getRepPortList: function(){
		let _t = this;
		
		Api.postApi(apiUrl.GEOFENCE_GET_REPPORT_URL, {}, function(res) {
			_t.setRepPortData(res);
		})
	},
	setRepPortData: function(data){
		this.repPortData = data;
	},
	getRepPortData: function(){
		return this.repPortData;
	},
	//hanmin
	setRepPortList: function(repPort){
		let html = '<option value="">Select</option>';
			
		if( !_isNull(repPort) ){
			let _cntCd = !_isNull(repPort) ? repPort.substring(0, 2): '';

			_each(this.getRepPortData(), (i)=>{
				let _repPort = _get(i, 'REP_PORT_CD');
				
				if( _cntCd === _repPort.substring(0, 2) ){
					html += `<option value="${_repPort}">${_repPort}</option>`;
				}
			})
		}
		else{
			html += _map(this.getRepPortData(), (i)=>{
									return `<option value="${_get(i, 'REP_PORT_CD')}">${_get(i, 'REP_PORT_CD')}</option>`;
									}).join('');
		}
		
		$("#selRepPort").html(html)
	},
	exportPortGrid: function(){
		let _t = this;

		let _portGrid = _t.getPortGeoGrid();
		let _url = apiUrl.GEOFENCE_GET_PORT_URL;
		let _parm = new URLSearchParams(_t.getPortParam()).toString();
		
		_url = `${_url}?${_parm}&page=1&perPage=9999`;

		_portGrid.setExportData(_url);
	
		_t.getPortGeoGrid().exportXlsx()
	},
	exportLocGrid: function(){
		let _t = this;

		let _portGrid = _t.getPortGeoGrid();
		let _locGrid = _t.getLocGeoGrid();

		let _portKey = _portGrid.getSelectedRowKey()
		let _portRow = _portGrid.getRow(_portKey);
		
		let _portCd = _get(_portRow, 'PORT_CD')

		let _url = apiUrl.GEOFENCE_GET_LOC_URL;
		let _parm = new URLSearchParams(_t.getLocParam(_portCd)).toString();

		_url = `${_url}?${_parm}`;

		_locGrid.setExportData(_url);

		_t.getLocGeoGrid().exportXlsx()
	},
	//hanmin exportRepport 추가
	exportRepPortGrid: function(){
		let _t = this;

		let _portGridMenu = _t.getRepPortGeoGrid();
		let _url = apiUrl.GEOFENCE_GET_REP_PORT_URL;
		let _parm = new URLSearchParams(_t.getRepPortParam()).toString();
		
		_url = `${_url}?${_parm}&page=1&perPage=9999`;

		_portGridMenu.setExportData(_url);
	
		_t.getRepPortGeoGrid().exportXlsx()
	},
	//hanmin exportRepLoc 추가
	exportRepLocGrid: function(){
		let _t = this;

		let _portGrid = _t.getRepPortGeoGrid();
		let _locGrid = _t.getRepLocGeoGrid();

		let _portKey = _portGrid.getSelectedRowKey()
		let _portRow = _portGrid.getRow(_portKey);
		
		let _portCd = _get(_portRow, 'REP_PORT_CD')

		let _url = apiUrl.GEOFENCE_GET_REP_LOC_URL;
		let _parm = $("#iptRepLocPortCd").val();

		_url = `${_url}?${_parm}`;

		_locGrid.setExportData(_url);

		_t.getLocGeoGrid().exportXlsx()
	},
	
	getPortParam: function(){
		let key = $("#srchPortKey").val();
		let val = $("#srchPortVal").val();
	  
		let param = {};
		param[key] = val;
		param['PORT_TYPE'] = $('#srchPortType').val();
		
		return param
	},
	//hanmin getRepPortParam 추가
	getRepPortParam: function(){
		let key = $("#srchRepPortKey").val();
		let val = $("#srchRepPortVal").val();
	  
		let param = {};
		param[key] = val;
		param['REP_PORT'] = $('#srchRepPortType').val();
		
		return param
	},
	getModalPortParam: function(){
		let target = $('#copyModal').hasClass('show') ? $('#copyModal') : $('#moveModal');
		
		let key = target.find("[name=mSrchPortKey]").val();
		let val = target.find("[name=mSrchPortVal]").val();
	  
		let param = {};
		param[key] = val;
		param['PORT_TYPE'] = target.find('[name=mSrchPortType]').val();
		
		return param
	},
	getLocParam: function(portCd){
		let type = $("#srchLocType").val();
		let kind = $("#srchLocKind").val();
		let locNm = $("#srchLocVal").val();

		let param = {};
		param['PORT_CD']   = portCd
		param['LOC_NAME']  = locNm;
		param['PORT_TYPE'] = type;
		param['AREA_KIND'] = kind;
		
		return param;
	},
	//hanmin
	getRepLocParam: function(repPort){
		let type = $("#srchLocType").val();
		let kind = $("#srchLocKind").val();
		let locNm = $("#srchLocVal").val();

		let param = {};
		param['REP_PORT_CD']   = repPort
		param['LOC_NAME']  = locNm;
		param['PORT_TYPE'] = type;
		param['AREA_KIND'] = kind;

		return param;
	},
	searchPort: function(){
		let _t = this;

		let _portGrid = _t.getPortGeoGrid();
		let _locGrid = _t.getLocGeoGrid();

		_locGrid.clear();
		_portGrid.reloadGrid(_t.getPortParam())
	},
	//hanmin
	searchRep: function(){
		let _t = this;

		let _repPortGrid = _t.getRepPortGeoGrid();
		let _repLocGrid = _t.getRepLocGeoGrid();

		_repLocGrid.clear();
		_repPortGrid.reloadGrid(_t.getRepPortParam())
	},
	searchCopyModalPort: function(){
		let _t = this;

		let _modalPortGrid = _t.getModalGridForCopyGeo();

		_modalPortGrid.reloadGrid(_t.getModalPortParam())
	},
	searchMoveModalPort: function(){
		let _t = this;

		let _modalPortGrid = _t.getModalGridForMoveGeo();

		_modalPortGrid.reloadGrid(_t.getModalPortParam())
	},
	searchRepPort: function(){
		let _t = this;
		let _repPort = $("#iptRepPortCd").val();

		if ( !_isNull(_repPort) ) {
			Api.postApi(apiUrl.GEOFENCE_GET_REPPORT_URL, { REP_PORT_CD: _repPort }, function(res){
				if ( _length(res) > 0 ) {
					_t.setRepPortForm(_head(res));
				} 
				else {
					Util.alert({ title: 'No Data', icon: 'warning' })
				}
			})
		} 
		else {
			$("#iptRepPortCd").focus();
		}
	},
	searchLoc: function(){
		let _t = this;

		let _portGrid = _t.getPortGeoGrid();
		let _locGrid = _t.getLocGeoGrid();

		let _portCd;

		if( !$("form#repFrm").hasClass("hide") ){
			let _portCd = $("#srchPortValForRepPort").val();

			if( _isNull(_portCd) ) {
				$("#srchPortValForRepPort").focus();
				return false;
			}
		}
		else {
			let _portKey = _portGrid.getSelectedRowKey()
			let _portRow = _portGrid.getRow(_portKey);
		
			_portCd = _get(_portRow, 'PORT_CD')
		}
		
		_locGrid.reloadGrid(_t.getLocParam(_portCd))
	},
	//hanmin
	searchRepLoc: function(){
		let _t = this;

		let _repPortGrid = _t.getRepPortGeoGrid();
		let _repLocGrid = _t.getRepLocGeoGrid();

		let _repPort;

		if( !$("form#repFrm").hasClass("hide") ){
			let _repPort = $("#srchRepPortValForRepPort").val();

			if( _isNull(_repPort) ) {
				$("#srchRepPortValForRepPort").focus();
				return false;
			}
		}
		else {
			let _portKey = _repPortGrid.getSelectedRowKey()
			let _portRow = _repPortGrid.getRow(_portKey);
		
			_repPort = _get(_portRow, 'REP_PORT_CD')
		}
		
		_repLocGrid.reloadGrid(_t.getRepLocParam(_repPort))
	},
	setModal: function (selector) {
		let _t = this;
		var modalList = _t.getModalList();
		if (_isNull(modalList)) {
		  modalList = {};
		}
		modalList[selector] = new bootstrap.Modal($(selector));
		_t.setModalList(modalList);
	},
	showModal: function (selector) {
		let _t = this;
	
		_t.getModalList()[selector].show();
	},
	showRepModal: function (selector) {
		let _t = this;
	
		_t.getModalList()[selector].show();
	},
	hideModal: function (selector) {
		let _t = this;
		_t.getModalList()[selector].hide();
	},
	setModalList: function (data) {
		this.modalList = data;
	},
	getModalList: function () {
		return this.modalList;
	},
	setPortGeoGrid: function(data){
        this.portGeoGrid = data;
    },
	setLocGeoGrid: function(data){
		this.locGeoGrid = data;
	}, 
	//hanmin
	setRepPortGeoGrid: function(data){
        this.repPortGeoGrid = data;
    },
	//hanmin
	setRepLocGeoGrid: function(data){
		this.repLocGeoGrid = data;
	}, 
	setModalGridForCopyGeo: function(data){
        this.modalGridForCopyGeo = data;
    },
	setModalGridForMoveGeo: function(data){
        this.modalGridForMoveGeo = data;
    },
	getPortGeoGrid: function(){
        return this.portGeoGrid;
    },
    getLocGeoGrid: function(){
		return this.locGeoGrid;
	},
	//hanmin
	getRepPortGeoGrid: function(){
        return this.repPortGeoGrid;
    },
	//hanmin
    getRepLocGeoGrid: function(){
		return this.repLocGeoGrid;
	},
	getModalGridForCopyGeo: function(){
		return this.modalGridForCopyGeo;
	},
	getModalGridForMoveGeo: function(){
		return this.modalGridForMoveGeo;
	},
	getLocGeoGrid: function(){
        return this.locGeoGrid;
    },
	initGrid: function(){
		let portGeoGrid = new TGrid('grid-table-port');
		let locGeoGrid  = new TGrid('grid-table-loc');
		//hanmin
		let repPortGeoGrid = new TGrid('grid-table-port-menu');
		let repLocGeoGrid  = new TGrid('grid-table-loc-menu');
		let modalGridForCopyGeo  = new TGrid('grid-table-copy-modal-port');
		let modalGridForMoveGeo  = new TGrid('grid-table-move-modal-port');

		portGeoGrid.setColumns([{
			name: "CRR_CD",
			header: "Carrier",
			align: "center",
			width: 80,
		  }, {
			name: "PORT_TYPE",
			header: "Type",
			align: "center",
			width: 50,
		  }, {
			name: "PORT_CD",
			header: "Port",
			align: "center",
			width: 100,
			sortable: true,
		  }, {
			name: "PORT_NM",
			header: "Name",
			sortable: true,
		  }, {
			name: "LOC_LAT",
			header: "Latitude",
			align: "right",
			width: 100,
			hidden: true
		  }, {
			name: "LOC_LON",
			header: "Longitude",
			align: "right",
			width: 100,
			hidden: true
		}, {
			name: "UN_LOC_CD",
			header: "UN/Locode",
			width: 100,
			align: "center",
			sortable: true,
			formatter: (data) => { return nullFormat(data.value); }
		}, {
			name: "REP_PORT_CD",
			header: "Rep. Port",
			align: "center",
			width: 100,
			sortable: true,
			formatter: (data) => { return nullFormat(data.value); }
		}, {
			name: "PORT_GEO",
			header: "Data",
			align: "center",
			width: "auto",
			formatter: (data) => { return !_isNull(data.value) ? 'Y' : 'N'; }
		}, {
			header: "Edit",
			name: "portGeoEdit",
			width: 40,
			formatter: ()=>{ return '<i class="bi bi-pencil-square" />';}
		}])

		locGeoGrid.setColumns([{
			name: "PORT_CD",
			header: "Port",
			align: "center",
			width: 80,
		  }, {
			name: "PORT_TYPE",
			header: "Type",
			align: "center",
			width: "auto",
			sortable: true,
			formatter: function (data) {
			  var type = data.value;
		
			  if (type == "C") {
				return "CNTR";
			  } else if (type == "B") {
				return "BULK";
			  } else if (type == "A") {
				return "ALL";
			  } else {
				return "Undefined";
			  }
			},
		  }, {
			name: "AREA_KIND",
			header: "Area",
			align: "center",
			width: 70,
			sortable: true,
			formatter: function (data) {
			  var type = data.value;
		
			  if (type == "4A") {
				return "Anchor";
			  } else if (type == "2B") {
				return "Berth";
			  } else if (type == "1T") {
				return "Terminal";
			  } else if (type == "3P") {
				return "Pilot";
			} else if (type == "5D") {
				return "Drifting Area";
			} else if (type == "6S") {
				return "Dock/Shipyard";
			  } else {
				return "Undefined";
			  }
			},
		  }, {
			name: "LOC_NAME",
			header: "Location Name",
			sortable: true,
			align: "left",
		  }, {
		/*	name: "DEFAULT_YN",
			align: "center",
			header: "Default",
		  }, {
			name: "LOC_LAT",
			header: "Latitude",
			align: "right",
		  }, {
			name: "LOC_LON",
			header: "Longitude",
			align: "right",
		  }, {*/
			name: "DWT_LMT",
			header: "DWT(Ton)",
			align: "right",
			width: 90,
		  }, {
			name: "DRAFT_LMT",
			header: "Draft(Meters)",
			align: "right",
			width: 90,
		  }, {
			name: "LOC_GEO",
			header: "Data",
			align: "center",
			width: "auto",
			formatter: (data) => { return !_isNull(data.value) ? 'Y' : 'N'; }
		  }, {
			header: "Edit",
			name: "locGeoEdit",
			width: 40,
			formatter: ()=>{ return '<i class="bi bi-pencil-square" />';}
		  }, {
			name: "PORT_CD",
			hidden: true,
		  }, {
			name: "DATA_TYPE",
			hidden: true,
		  }, {
			name: "LOC_CD",
			hidden: true,
		  }])
		  //hanmin
	  repPortGeoGrid.setColumns([{
		name: "CRR_CD",
		header: "Carrier",
		align: "center",
		width: 160,
		 }, {
		name: "REP_PORT",
		header: "RepPort",
		align: "center",
		width: 220,
	  }, {
		name: "LOC_LAT",
		header: "LocLat",
		align: "center",
		width: 155,
	  }, {
		name: "LOC_LON",
		header: "LocLon",
		align: "center",
		width: 155,
	  }, {
		name: "PORT_GEO",
		header: "Data",
		align: "center",
		width: "auto",
		formatter: (data) => { return !_isNull(data.value) ? 'Y' : 'N'; }
		}, {
		header: "Edit",
		name: "repPortGeoEdit",
		width: 40,
		formatter: ()=>{ return '<i class="bi bi-pencil-square" />';}
		}])
		
		//hanmin
		repLocGeoGrid.setColumns([{
			name: "PORT_CD",
			header: "Port",
			align: "center",
			width: 80,
		  }, {
			name: "PORT_TYPE",
			header: "Type",
			align: "center",
			width: "auto",
			sortable: true,
			formatter: function (data) {
			  var type = data.value;
		
			  if (type == "C") {
				return "CNTR";
			  } else if (type == "B") {
				return "BULK";
			  } else if (type == "A") {
				return "ALL";
			  } else {
				return "Undefined";
			  }
			},
		  }, {
			name: "AREA_KIND",
			header: "Area",
			align: "center",
			width: 70,
			sortable: true,
			formatter: function (data) {
			  var type = data.value;
		
			  if (type == "4A") {
				return "Anchor";
			  } else if (type == "2B") {
				return "Berth";
			  } else if (type == "1T") {
				return "Terminal";
			  } else if (type == "3P") {
				return "Pilot";
			} else if (type == "5D") {
				return "Drifting Area";
			} else if (type == "6S") {
				return "Dock/Shipyard";
			  } else {
				return "Undefined";
			  }
			},
		  }, {
			name: "LOC_NAME",
			header: "Location Name",
			sortable: true,
			align: "left",
		  }, {
		/*	name: "DEFAULT_YN",
			align: "center",
			header: "Default",
		  }, {
			name: "LOC_LAT",
			header: "Latitude",
			align: "right",
		  }, {
			name: "LOC_LON",
			header: "Longitude",
			align: "right",
		  }, {*/
			name: "DWT_LMT",
			header: "DWT(Ton)",
			align: "right",
			width: 90,
		  }, {
			name: "DRAFT_LMT",
			header: "Draft(Meters)",
			align: "right",
			width: 90,
		  }, {
			name: "LOC_GEO",
			header: "Data",
			align: "center",
			width: "auto",
			formatter: (data) => { return !_isNull(data.value) ? 'Y' : 'N'; }
		  }, {
			header: "Edit",
			name: "repLocGeoEdit",
			width: 40,
			formatter: ()=>{ return '<i class="bi bi-pencil-square" />';}
		  }, {
			name: "PORT_CD",
			hidden: true,
		  }, {
			name: "DATA_TYPE",
			hidden: true,
		  }, {
			name: "LOC_CD",
			hidden: true,
		  }])


		modalGridForCopyGeo.setColumns([{
			name: "CRR_CD",
			header: "Carrier",
			align: "center",
			width: 80,
		  }, {
			name: "PORT_TYPE",
			header: "Type",
			align: "center",
			width: 50,
		  }, {
			name: "PORT_CD",
			header: "Port",
			align: "center",
			width: 100,
			sortable: true,
		  }, {
			name: "PORT_NM",
			header: "Name",
			sortable: true,
		  }, {
			name: "LOC_LAT",
			header: "Latitude",
			align: "right",
			width: 100,
			hidden: true
		  }, {
			name: "LOC_LON",
			header: "Longitude",
			align: "right",
			width: 100,
			hidden: true
		  }, {
				name: "UN_LOC_CD",
				header: "UN/Locode",
				width: 100,
				align: "center",
				sortable: true,
				formatter: (data) => { return nullFormat(data.value); }
			}, {
				name: "REP_PORT_CD",
				header: "Rep. Port",
				align: "center",
				width: 100,
				sortable: true,
				formatter: (data) => { return nullFormat(data.value); }
		  }])
		
		modalGridForMoveGeo.setColumns([{
			name: "CRR_CD",
			header: "Carrier",
			align: "center",
			width: 80,
		  }, {
			name: "PORT_TYPE",
			header: "Type",
			align: "center",
			width: 50,
		  }, {
			name: "PORT_CD",
			header: "Port",
			align: "center",
			width: 100,
			sortable: true,
		  }, {
			name: "PORT_NM",
			header: "Name",
			sortable: true,
		  }, {
			name: "LOC_LAT",
			header: "Latitude",
			align: "right",
			width: 100,
			hidden: true
		  }, {
			name: "LOC_LON",
			header: "Longitude",
			align: "right",
			width: 100,
			hidden: true
		  }, {
			name: "UN_LOC_CD",
			header: "UN/Locode",
			width: 100,
			align: "center",
			sortable: true,
			formatter: (data) => { return nullFormat(data.value); }
			}, {
			name: "REP_PORT_CD",
			header: "Rep. Port",
			align: "center",
			width: 100,
			sortable: true,
			formatter: (data) => { return nullFormat(data.value); }
		  }])

		portGeoGrid.setDataSource({
            api: { readData: { url: apiUrl.GEOFENCE_GET_PORT_URL, method: "get" }}
        });
		locGeoGrid.setDataSource({
            api: { readData: { url: apiUrl.GEOFENCE_GET_LOC_URL, method: "get" }}
        });
		//hanmin
		repPortGeoGrid.setDataSource({
			api: { readData: { url: apiUrl.GEOFENCE_GET_REP_PORT_URL, method: "get" }}
		});
		//hanmin
		repLocGeoGrid.setDataSource({
            api: { readData: { url: apiUrl.GEOFENCE_GET_REP_LOC_URL, method: "get" }}
        });
		modalGridForCopyGeo.setDataSource({
            api: { readData: { url: apiUrl.GEOFENCE_GET_PORT_URL, method: "get" }}
        });
		modalGridForMoveGeo.setDataSource({
            api: { readData: { url: apiUrl.GEOFENCE_GET_PORT_URL, method: "get" }}
        });
        
		portGeoGrid.setGrid({ bodyHeight: 430, columnOptions: { resizable: true }, pageOptions: { perPage: 10 } });
		locGeoGrid.setGrid({ rowHeaders: ["checkbox"], bodyHeight: 350, columnOptions: { resizable: true } });
		//hanmin
		repPortGeoGrid.setGrid({ bodyHeight: 430, columnOptions: { resizable: true }, pageOptions: { perPage: 10 } });
		//hanmin
		repLocGeoGrid.setGrid({ rowHeaders: ["checkbox"], bodyHeight: 350, columnOptions: { resizable: true } });
		modalGridForCopyGeo.setGrid({ rowHeaders: ["checkbox"], bodyHeight: 430, columnOptions: { resizable: true }, pageOptions: { perPage: 10 }  });
		modalGridForMoveGeo.setGrid({ rowHeaders: ["checkbox"], bodyHeight: 430, columnOptions: { resizable: true }, pageOptions: { perPage: 10 }  });
		
		let _t = this;

		portGeoGrid.clickEvent(function(e){
			var column = e.columnName;
			var rowKey = e.rowKey;
		
			if( column == 'portGeoEdit' && rowKey != undefined ) {
			  var _row = portGeoGrid.getRow(rowKey);
		
			  _t.goPortEdit(_get(_row, 'PORT_CD'));
		
			  /** Form에 value 값 세팅 */
			  _t.setPortForm(_row);
			}
		})
		
		portGeoGrid.dbClickEvent(function(e){
			var rowKey = e.rowKey;
			var row = portGeoGrid.getRow(rowKey);
			
			var prevKey = portGeoGrid.getSelectedRowKey();

			// 표시된 layer, marker 제거
			mapFunc('GeofenceMapRemoveMap');
			
			if (!_isNull(prevKey) && prevKey == rowKey) {
			
				portGeoGrid.removeRowClass(prevKey, "selected"); /** selected row style 제거 */
				
				locGeoGrid.clear(); /** Location Grid 초기화 */
		
				$('#locGeoList .btn-group').hide();  /** Port의 신규 Location 생성 버튼 비활성화 */
		
				_t.drawPortGeo();
			} 
			else {
				portGeoGrid.removeRowClass(prevKey, "selected"); /** selected row style 설정 */
				portGeoGrid.addRowClass(rowKey, "selected");
				
				locGeoGrid.reloadGrid({ PORT_CD: _get(row, 'PORT_CD') }); /** 해당 Port와 일치하는 Location Grid 조회 */
		
				$('#locGeoList .btn-group').show(); /** Port의 신규 Location 생성 버튼 활성화 */
				
				/** map에 해당 Port의 Data & Lat/Lon 그리기 */
				_t.drawPortGeo({
						geoData: _get(row, 'PORT_GEO'),
						latlonData: { lat: _get(row, 'LOC_LAT'), lon: _get(row, 'LOC_LON') },
						label: _get(row, 'PORT_CD'),
				});
			}
		})

		locGeoGrid.clickEvent(function(e){
			var column = e.columnName;
			var rowKey = e.rowKey;
		
			if( column == 'locGeoEdit' && rowKey != undefined ) {
				var _row = locGeoGrid.getRow(rowKey);
				
			 	 _t.goLocEdit();
				
			  	/** Form에 value 값 세팅 */
			  	_t.setLocForm(_row);
			}
		})
		
		locGeoGrid.dbClickEvent(function(e){
			var _grid  = e.instance;

			var rowKey = e.rowKey;

			var dupKey = _find(locGeoGrid.getSelectedRowsKey(), (_key) => { return rowKey == _key; });

			if( !_isNull(dupKey) ) {
				_grid.uncheck(rowKey);
			}else{
				_grid.check(rowKey);
			}
		});

		_t.checkProcess = []
		locGeoGrid.checkEvent(function(e){
			let rowKey = e.rowKey;
			if(_find_index(_t.checkProcess, (i)=>{ return i == rowKey }) > -1) {
				_t.uncheck(e.rowKey);
				return false;
			};
			_t.checkProcess.push(rowKey);

			let row = locGeoGrid.getRow(rowKey);

			locGeoGrid.addRowClass(rowKey, "selected");

			_t.drawLocGeo({ geoData: _get(row, 'LOC_GEO'),
				latlonData: { lat: _get(row, 'LOC_LAT'), lon: _get(row, 'loLOC_LONcLon') },
				label: _get(row, 'LOC_NAME'),
				key: rowKey
			})

			setTimeout(()=>{
				_t.checkProcess = _t.checkProcess.filter((t) => t !== rowKey);
			}, 30)
		})
		
		locGeoGrid.uncheckEvent(function(e){
			var rowKey = e.rowKey;
			locGeoGrid.removeRowClass(rowKey, "selected");

			mapFunc('GeofenceMapRemoveLayerByKey', rowKey);
		});
		
		locGeoGrid.allCheckEvent(function(e){
			let _grid = e.instance;
			_grid.uncheckAll(true);

			_each(_grid.getData(), (row) => {
				_grid.check(_get(row, 'rowKey'));
			})
		});
		locGeoGrid.allUncheckEvent(function(e){
			let _grid = e.instance;

			_each(_grid.getData(), (row) => {
				_grid.uncheck(_get(row, 'rowKey'));
			})
		});
		
		//hanmin
		repPortGeoGrid.clickEvent(function(e){
			var column = e.columnName;
			var rowKey = e.rowKey;
		
			if( column == 'repPortGeoEdit' && rowKey != undefined ) {
			  var _row = repPortGeoGrid.getRow(rowKey);
		
			  _t.goRepPortEdit(_get(_row, 'REP_PORT'));
		
			  /** Form에 value 값 세팅 */
			  _t.setRepPortForm(_row);
			}
		})
		//hanmin
		repPortGeoGrid.dbClickEvent(function(e){
			var rowKey = e.rowKey;
			var row = repPortGeoGrid.getRow(rowKey);
			
			var prevKey = repPortGeoGrid.getSelectedRowKey();

			// 표시된 layer, marker 제거
			mapFunc('GeofenceMapRemoveMap');
			
			if (!_isNull(prevKey) && prevKey == rowKey) {
			
				repPortGeoGrid.removeRowClass(prevKey, "selected"); /** selected row style 제거 */
				
				repLocGeoGrid.clear(); /** Location Grid 초기화 */
		
				$('#repLocGeoList .btn-group').hide();  /** Port의 신규 Location 생성 버튼 비활성화 */
		
				_t.drawPortGeo();
			} 
			else {
				repPortGeoGrid.removeRowClass(prevKey, "selected"); /** selected row style 설정 */
				repPortGeoGrid.addRowClass(rowKey, "selected");
				
				repLocGeoGrid.reloadGrid({ REP_PORT_CD: _get(row, 'REP_PORT') }); /** 해당 Port와 일치하는 Location Grid 조회 */
				
				$('#repLocGeoList .btn-group').show(); /** Port의 신규 Location 생성 버튼 활성화 */
				
				/** map에 해당 Port의 Data & Lat/Lon 그리기 */
				_t.drawPortGeo({
						geoData: _get(row, 'PORT_GEO'),
						latlonData: { lat: _get(row, 'LOC_LAT'), lon: _get(row, 'LOC_LON') },
						label: _get(row, 'PORT_CD'),
				});
			}
		})
		//hanmin
		repLocGeoGrid.clickEvent(function(e){
			var column = e.columnName;
			var rowKey = e.rowKey;
		
			if( column == 'repLocGeoEdit' && rowKey != undefined ) {
				var _row = repLocGeoGrid.getRow(rowKey);
				
			 	 _t.goRepLocEdit();
				
			  	/** Form에 value 값 세팅 */
			  	_t.setLocForm(_row);
			}
		})
		//hanmin
		repLocGeoGrid.dbClickEvent(function(e){
			var _grid  = e.instance;

			var rowKey = e.rowKey;

			var dupKey = _find(repLocGeoGrid.getSelectedRowsKey(), (_key) => { return rowKey == _key; });

			if( !_isNull(dupKey) ) {
				_grid.uncheck(rowKey);
			}else{
				_grid.check(rowKey);
			}
		});
		//hanmin
		_t.checkProcess = []
		repLocGeoGrid.checkEvent(function(e){
			let rowKey = e.rowKey;
			if(_find_index(_t.checkProcess, (i)=>{ return i == rowKey }) > -1) {
				_t.uncheck(e.rowKey);
				return false;
			};
			_t.checkProcess.push(rowKey);

			let row = repLocGeoGrid.getRow(rowKey);

			repLocGeoGrid.addRowClass(rowKey, "selected");

			_t.drawLocGeo({ geoData: _get(row, 'LOC_GEO'),
				latlonData: { lat: _get(row, 'LOC_LAT'), lon: _get(row, 'loLOC_LONcLon') },
				label: _get(row, 'LOC_NAME'),
				key: rowKey
			})

			setTimeout(()=>{
				_t.checkProcess = _t.checkProcess.filter((t) => t !== rowKey);
			}, 30)
		})
		//hanmin
		repLocGeoGrid.uncheckEvent(function(e){
			var rowKey = e.rowKey;
			repLocGeoGrid.removeRowClass(rowKey, "selected");

			mapFunc('GeofenceMapRemoveLayerByKey', rowKey);
		});
		//hanmin
		repLocGeoGrid.allCheckEvent(function(e){
			let _grid = e.instance;
			_grid.uncheckAll(true);

			_each(_grid.getData(), (row) => {
				_grid.check(_get(row, 'rowKey'));
			})
		});
		//hanmin
		repLocGeoGrid.allUncheckEvent(function(e){
			let _grid = e.instance;

			_each(_grid.getData(), (row) => {
				_grid.uncheck(_get(row, 'rowKey'));
			})
		});

		modalGridForCopyGeo.dbClickEvent(function(e){
			var _grid  = e.instance;

			var rowKey = e.rowKey;

			var dupKey = _find(modalGridForCopyGeo.getSelectedRowsKey(), (_key) => { return rowKey == _key; });

			if( !_isNull(dupKey) ) {
				_grid.uncheck(rowKey);
			}else{
				_grid.check(rowKey);
			}
		})

		modalGridForCopyGeo.checkEvent(function(e){
			var rowKey = e.rowKey;
			var _grid  = e.instance;

			var allRows = modalGridForCopyGeo.getRows();
			allRows.forEach((row) => {
				if (row.rowKey != rowKey)
					_grid.uncheck(row.rowKey);
			})
		 
			modalGridForCopyGeo.addRowClass(rowKey, 'selected');

        })

		modalGridForCopyGeo.uncheckEvent(function(e){
			var rowKey = e.rowKey;
			modalGridForCopyGeo.removeRowClass(rowKey, "selected");

		});

		// move modal grid
		modalGridForMoveGeo.dbClickEvent(function(e){
			var _grid  = e.instance;

			var rowKey = e.rowKey;

			var dupKey = _find(modalGridForMoveGeo.getSelectedRowsKey(), (_key) => { return rowKey == _key; });

			if( !_isNull(dupKey) ) {
				_grid.uncheck(rowKey);
			}else{
				_grid.check(rowKey);
			}
		})

		modalGridForMoveGeo.checkEvent(function(e){
			var rowKey = e.rowKey;
			var _grid  = e.instance;

			var allRows = modalGridForMoveGeo.getRows();
			allRows.forEach((row) => {
				if (row.rowKey != rowKey)
					_grid.uncheck(row.rowKey);
			})
		 
			modalGridForMoveGeo.addRowClass(rowKey, 'selected');

        })

		modalGridForMoveGeo.uncheckEvent(function(e){
			var rowKey = e.rowKey;
			modalGridForMoveGeo.removeRowClass(rowKey, "selected");

		});

		portGeoGrid.setSelectClass('selected');
		locGeoGrid.setSelectClass('selected');
		//hanmin
		repPortGeoGrid.setSelectClass('selected');
		repLocGeoGrid.setSelectClass('selected');
		modalGridForCopyGeo.setSelectClass('selected');
		modalGridForMoveGeo.setSelectClass('selected');

		_t.setPortGeoGrid(portGeoGrid)
		_t.setLocGeoGrid(locGeoGrid)
		//hanmin
		_t.setRepPortGeoGrid(repPortGeoGrid)
		_t.setRepLocGeoGrid(repLocGeoGrid)
		_t.setModalGridForCopyGeo(modalGridForCopyGeo)
		_t.setModalGridForMoveGeo(modalGridForMoveGeo)
	},
	checkTypeCd: function(){
		let type = $(this).val();

		if( "C" == type ){
			$('#iptRadius').parent().parent().removeClass("d-none");
		}else{
			$('#iptRadius').parent().parent().addClass("d-none");
		}
	},
	chagneRadiusData: function(){
		let geoData = $('#iptLocGeoData').val();
		let radius = _nvl($(this).val(), 0);
		let arr = new Array();

		if( !_isNull(geoData) ){
			arr = JSON.parse(geoData);
			
			var prop  = arr.features[0].properties;
			var type = arr.features[0].geometry.type;

			if( type === "Point" && radius ){
				prop.radius = radius;
			}
		}
		updateInputGeoData({ selector: '#iptLocGeoData', geoData: JSON.stringify(arr), radius: radius })
	},
	chagneGeoData: function(){
		let geoData = $(this).val();
		let arr = new Array();

		if( !_isNull(geoData) ){
			try {
				arr = JSON.parse(geoData);
			
				var radius  = arr.features[0].properties.radius;
				var type = arr.features[0].geometry.type;

				if( type === "Point" && radius ){
					$('#iptRadius').val(radius);
				}
			} catch (e) {
				return false;
			}
		}
	},
	showSelectedElement: function(selArr){
		let elArr = [
			'#portGeoList',
			'#repPortGeoList',
			'#locGeoList',
			'#repLocGeoList',
			'form#portFrm',
			'form#locFrm',
			'form#repFrm',
			'form#repEditFrm',
			'form#repLocFrm',
			'#viewVessel',
			'#locGeoList .btn-group',
			'#repLocGeoList .btn-group',
			'#srchLocAreaForRepPort',
			'#locFrm button.fl_r',
			'#repLocFrm button.fl_r'
		  ];
		
		  _each(elArr, function (el) {
			if( _some(selArr, (sel)=>{ return el == sel}) ){
					//$(el).removeClass('d-none')
				$(el).show();
			}
			else{
				//$(el).addClass('d-none')
				$(el).hide();
			}
		});
	},
	//hanmin tsPort 처리
	updatePort: function(){
		let _t = this;
		let tsPort= "N";
		let confirmFunc = function(res){
			var checkbox = document.querySelector('input[name="checkTs"]');
			if(checkbox.checked){
				tsPort = "Y";
			}
			if ( res.isConfirmed ) {
				let parm = { PORT_CD: $("#iptPortCd").val(), 
										 PORT_NM: $("#iptPortNm").val(), 
										 UN_LOC_CD: $("#iptUnlocode").val(), 
										 TS_PORT: tsPort,
										 PORT_GEO: $("#iptPortGeoData").val().replace(/\s/g, ''),
										 REP_PORT_CD: $("#selRepPort").val(),
										 LOC_LAT: $("#iptPortLat").val(),
										 LOC_LON: $("#iptPortLon").val(),
										 PORT_TYPE: $("#selPortGeoType").val() };
											
				let url = $('#iptPortCd').prop('readonly') == true ? apiUrl.GEOFENCE_UPD_PORT_URL : apiUrl.GEOFENCE_ADD_PORT_URL;
				let updPort = function(res){
					Util.alert({ title: res.msg, icon: res.status })
					
					_t.goPortList($("#iptPortCd").val());

					mapFunc('GeofenceUpdateData');
				};
				Api.postApi(url, parm, updPort);
			}
    }
    Util.confirm({ title: '저장하시겠습니까?', icon: 'warning' }, confirmFunc);
	},
	//hanmin port 검색 후 rep insert
	updateRepPort: function() {
		let _t = this;
		let portCd = $("#iptRepPortCd").val();
		
		let repPort = $("#iptRepPortCd").val();
		console.log("PortCd 값:", portCd);
		console.log("RepPort 값:", repPort);
		let urlRep = apiUrl.GEOFENCE_SEARCH_REP_PORT_CD_URL;
		let url = apiUrl.GEOFENCE_SEARCH_PORT_CD_URL;
		let param = { PORT_CD: portCd };
		let paramRep = { REP_PORT: repPort};
		Api.getApi(url, param, function(res){
			console.log(res.status);
			if (res.status === "success") {

				Api.getApi(urlRep, paramRep, function(resRep){
					if(resRep.status === "success"){
						Util.alert({ title: "중복 실패", msg: res.msg, icon: "error" });
					}else{
						
						Util.alert({ title: res.msg, icon: res.status });
						let confirmFunc = function(confirmRes) {
							if (confirmRes.isConfirmed) {
								let parm = { 
									REP_PORT: res.PORT_CD[0].PORT_CD,
									PORT_GEO: res.PORT_CD[0].PORT_GEO,
									LOC_LAT: res.PORT_CD[0].LOC_LAT,
									LOC_LON: res.PORT_CD[0].LOC_LON,
									CRE_USR_ID: res.PORT_CD[0].CRE_USR_ID,
									CRE_DT: res.PORT_CD[0].CRE_DT,
									UPD_USR_ID: res.PORT_CD[0].UPD_USR_ID,
									UPD_DT: res.PORT_CD[0].UPD_DT,
									REG_DT: res.PORT_CD[0].REG_DT,
									UPD_USR_NO: res.PORT_CD[0].UPD_USR_NO, };
								url = apiUrl.GEOFENCE_ADD_REP_PORT_URL;
								Api.postApi(url, parm, function(saveRes) {
									Util.alert({ title: saveRes.msg, icon: saveRes.status });
									_t.getRepPortList();
									_t.goRepPortMenu();
								});
							}
						};
						Util.confirm({ title: '저장하시겠습니까?', icon: 'warning' }, confirmFunc);
					}
				});
			} else {
				Util.alert({ title: "검색 실패", msg: res.msg, icon: "error" });
			}
		});
	},
	updateRepLoc: function(){
		let _t = this;
		let confirmFunc = function(res){
    	if ( res.isConfirmed ) {
			let parm = { REP_PORT_CD: $("#iptRepLocPortCd").val(),
				LOC_CD: $("#iptRepLocCd").val(),
				LOC_NAME: $("#iptRepLocNm").val(),
				PORT_TYPE: $("#selRepPortType").val(),
				AREA_KIND: $("#selRepAreaKind").val(),
				DATA_TYPE: $("#selRepGeoTypeCd").val(),
				LOC_GEO: $("#iptRepLocGeoData").val().replace(/\s/g, ''),
				RAD_SIZE: $("#iptRepRadius").val(),
				DEFAULT_YN: $("input:checkbox[name=chkDefaultYn]").is(":checked") ? 'Y' : 'N',
				LOC_LAT: $("#iptRepLocLat").val(),
				LOC_LON: $("#iptRepLocLon").val(),
				DWT_LMT: $("#iptRepLocDwt").val(),
				DRAFT_LMT:  $("#iptRepLocDraft").val() };
				let url = apiUrl.GEOFENCE_ADD_REP_LOC_URL;
				let updPort = function(res){
					Util.alert({ title: res.msg, icon: res.status })
        
					_t.goRepLocList();

					mapFunc('GeofenceUpdateData');
				};
				Api.postApi(url, parm, updPort);
			}
		}
		Util.confirm({ title: '저장하시겠습니까?', icon: 'warning' }, confirmFunc);
	},
	updateLoc: function(){
		let _t = this;
		let confirmFunc = function(res){
    	if ( res.isConfirmed ) {
				let parm = { PORT_CD: $("#iptLocPortCd").val(),
										 LOC_CD: $("#iptLocCd").val(),
										 LOC_NAME: $("#iptLocNm").val(),
										 PORT_TYPE: $("#selPortType").val(),
										 AREA_KIND: $("#selAreaKind").val(),
										 DATA_TYPE: $("#selGeoTypeCd").val(),
										 LOC_GEO: $("#iptLocGeoData").val().replace(/\s/g, ''),
										 RAD_SIZE: $("#iptRadius").val(),
										 DEFAULT_YN: $("input:checkbox[name=chkDefaultYn]").is(":checked") ? 'Y' : 'N',
										 LOC_LAT: $("#iptLocLat").val(),
										 LOC_LON: $("#iptLocLon").val(),
										 DWT_LMT: $("#iptLocDwt").val(),
										 DRAFT_LMT:  $("#iptLocDraft").val() };
				let url = !_isNull(parm.LOC_CD) ? apiUrl.GEOFENCE_UPD_LOC_URL : apiUrl.GEOFENCE_ADD_LOC_URL;
				let updPort = function(res){
					Util.alert({ title: res.msg, icon: res.status })
        
					_t.goLocList();

					mapFunc('GeofenceUpdateData');
				};
				Api.postApi(url, parm, updPort);
			}
		}
		Util.confirm({ title: '저장하시겠습니까?', icon: 'warning' }, confirmFunc);
	},
	//hanmin
	goPortList: function(portCd){
		let _t = this;
		_t.showSelectedElement(["#portGeoList", "#locGeoList"]);

		$("#srchPortVal").val(portCd);
		$("#srchLocVal").val("");
		$("#srchPortValForRepPort").val("");

		var param = { PORT_CD: portCd };

		let _portGeoGrid = this.getPortGeoGrid();
		let _locGeoGrid  = this.getLocGeoGrid();
		_portGeoGrid.reloadGrid(param)
		_locGeoGrid.reloadGrid();
		
		mapFunc('GeofenceMapRemoveMap');
	},
	//hanmin
	goRepList: function(repPort) {
		let _t = this;
		_t.showSelectedElement(["#repPortGeoList", "#repLocGeoList"]);

		$("#srchRepPortVal").val(repPort);
		$("#srchRepLocVal").val("");
		$("#srchRepPortValForRepPort").val("");
	
		var param = { REP_PORT: repPort };
	
		let _repPortGeoGrid = this.getRepPortGeoGrid();
		let _repLocGeoGrid  = this.getRepLocGeoGrid();
		_repPortGeoGrid.reloadGrid(param);
		_repLocGeoGrid.reloadGrid();
		
		mapFunc('GeofenceMapRemoveMap');
	},
	//hanmin
	goPortMenu: function(portCd){
		let _t = this;
		_t.showSelectedElement(["#portGeoList", "#locGeoList"]);

		$("#srchPortVal").val(portCd);
		$("#srchLocVal").val("");
		$("#srchPortValForRepPort").val("");

		var param = { PORT_CD: portCd };

		let _portGeoGrid = this.getPortGeoGrid();
		let _locGeoGrid  = this.getLocGeoGrid();
		_portGeoGrid.reloadGrid(param)
		_locGeoGrid.reloadGrid();

		mapFunc('GeofenceMapRemoveMap');
	},
	goLocList: function(portCd){
		let _portCd = !_isNull(portCd) ? portCd : $("#iptLocPortCd").val();

		let _t = this;
		_t.showSelectedElement(["#portGeoList", "#locGeoList", '#locGeoList .btn-group']);
		$('#locGeoList').removeClass('hide')
	
		var param = { PORT_CD: _portCd };
		let _portGeoGrid = this.getPortGeoGrid();
		let _locGeoGrid  = this.getLocGeoGrid();
		_portGeoGrid.reloadGrid(param)
		_locGeoGrid.reloadGrid(param);

		$("#srchPortVal").val(_portCd);
		$("#srchLocVal").val("");
		$("#srchPortValForRepPort").val("");

		mapFunc('GeofenceMapRemoveMap');
	},
	//hanmin
	goRepLocList: function(repPort){
		let _repPort = !_isNull(repPort) ? repPort : $("#iptRepLocPortCd").val();

		let _t = this;
		_t.showSelectedElement(["#repPortGeoList", "#repLocGeoList", '#repLocGeoList .btn-group']);
		$('#repLocGeoList').removeClass('hide')
	
		var param = { REP_PORT_CD: _repPort };
		let _repPortGeoGrid = this.getRepPortGeoGrid();
		let _repLocGeoGrid  = this.getRepLocGeoGrid();
		_repPortGeoGrid.reloadGrid(param)
		_repLocGeoGrid.reloadGrid(param);

		$("#srchRepPortVal").val(_repPort);
		$("#srchRepLocVal").val("");
		$("#srchRepPortValForRepPort").val("");

		mapFunc('GeofenceMapRemoveMap');
	},
	//hanmin
	goRepPortMenu: function(){
		let _t = this;

		let _locGeoGrid = _t.getLocGeoGrid();
		_locGeoGrid.getGrid().uncheckAll(true);

		mapFunc('GeofenceMapRemoveMap');

		_t.showSelectedElement(["#repPortGeoList", "#repLocGeoList"]);
	},
	//hanmin
	goPortAdd: function(){
		let _t = this;

		let _locGeoGrid = _t.getLocGeoGrid();
		_locGeoGrid.getGrid().uncheckAll(true);
		
		mapFunc('GeofenceMapRemoveMap');

		_t.showSelectedElement(["form#portFrm", "#viewVessel"]);
		
		_t.resetForm("form#portFrm");

		_t.setRepPortList();
	},
	//hanmin
	goRepPortAdd: function(){
		let _t = this;

		let _locGeoGrid = _t.getRepLocGeoGrid();
		_locGeoGrid.getGrid().uncheckAll(true);

		mapFunc('GeofenceMapRemoveMap');

		_t.showSelectedElement(["form#repFrm"]);
		_t.resetForm("form#repFrm");
	},
	goLocAdd: function(){
		let _t = this;

		let _portGeoGrid = _t.getPortGeoGrid();
		var _rowKey = _nvl(_portGeoGrid.getSelectedRowKey(), 0)
		var _row = _portGeoGrid.getRow(_rowKey);

		mapFunc('GeofenceMapRemoveMap');

		_t.showSelectedElement(["form#locFrm", "#viewVessel"]);
	
		_t.resetForm("form#locFrm");

		$("#iptLocPortCd").val(_get(_row, 'PORT_CD'));
		$("#selPortType").attr("disabled", false);
	},
	//hanmin
	goRepLocAdd: function(){
		let _t = this;

		let _repPortGeoGrid = _t.getRepPortGeoGrid();
		var _rowKey = _nvl(_repPortGeoGrid.getSelectedRowKey(), 0)
		var _row = _repPortGeoGrid.getRow(_rowKey);

		mapFunc('GeofenceMapRemoveMap');

		_t.showSelectedElement(["form#repLocFrm", "#viewVessel"]);
		console.log("qweqwe");
		_t.resetForm("form#repLocFrm");

		$("#iptRepLocPortCd").val(_get(_row, 'REP_PORT'));
		$("#selRepPortType").attr("disabled", false);
	},
	goPortEdit: function(portCd){
		mapFunc('GeofenceMapRemoveMap');

		this.showSelectedElement(["form#portFrm", "#locGeoList", "#viewVessel", '#locGeoList .btn-group']);

		let _locGeoGrid = this.getLocGeoGrid();
		_locGeoGrid.reloadGrid({ PORT_CD: portCd });

		$('#iptPortCd').prop('readonly', true);

		this.setRepPortList(portCd);
	},
	//hanmin
	goRepPortEdit: function(repPort){
		mapFunc('GeofenceMapRemoveMap');
	
		this.showSelectedElement(["form#repEditFrm", "#repLocGeoList", "#viewVessel", '#repLocGeoList .btn-group']);
	
		let _repLocGeoGrid = this.getRepLocGeoGrid();
		_repLocGeoGrid.reloadGrid({ REP_PORT: repPort });
	
		$('#iptRepPortCd').text(repPort);
	
		this.setRepPortList(repPort);
	},
	goLocEdit: function(){
		mapFunc('GeofenceMapRemoveMap');

		$('#locGeoList').addClass('hide')
		
		this.showSelectedElement(["form#locFrm", "#viewVessel", '#locFrm button.fl_r']);
		$("#selPortType").attr("disabled", true);
	},
	//hanmin
	goRepLocEdit: function(){
		mapFunc('GeofenceMapRemoveMap');

		$('#repLocGeoList').addClass('hide')
		
		this.showSelectedElement(["form#repLocFrm", "#viewVessel", '#repLocFrm button.fl_r']);
		$("#selRepPortType").attr("disabled", true);
	},
	resetForm: function(selFrmNm){
		$(selFrmNm).get(0).reset();

		var $iptRadius = $("#iptRadius").parent().parent();
		if ( !$iptRadius.hasClass("d-none") ) { 
			$iptRadius.addClass("d-none");
			$iptRadius.hide()
		}
		$("input[name='chkDefaultYn']").prop("checked", false);
		$('#iptPortCd').prop('readonly', false);
		$("#isValidPortCd").prop("checked", true);
	},
	resetPortProc:function(){
		let _t = this;
		let confirmFunc = function(res){
			if ( res.isConfirmed ) {
				_t.resetForm("form#portFrm");
				mapFunc('GeofenceMapRemoveMap');
			}
		}
		Util.confirm({ title: '정보를 다시 입력하시겠습니까?', icon: 'warning' }, confirmFunc);
	},
	resetRepPortProc:function(){
		let _t = this;
		let confirmFunc = function(res){
			if ( res.isConfirmed ) {
				_t.resetForm("form#repFrm");
				mapFunc('GeofenceMapRemoveMap');
			}
		}
		Util.confirm({ title: '정보를 다시 입력하시겠습니까?', icon: 'warning' }, confirmFunc);
	},
	resetLocProc:function(){
		let _t = this;
		let confirmFunc = function(res){
			if ( res.isConfirmed ) {
				var portCd = $("#iptLocPortCd").val();

				_t.resetForm("form#locFrm");
				mapFunc('GeofenceMapRemoveMap');
				
				$("#iptLocPortCd").val(portCd);
			}
		}
		Util.confirm({ title: '정보를 다시 입력하시겠습니까?', icon: 'warning' }, confirmFunc);
	},
	//hanmin
	resetRepLocProc:function(){
		let _t = this;
		let confirmFunc = function(res){
			if ( res.isConfirmed ) {
				var portCd = $("#iptRepLocPortCd").val();

				_t.resetForm("form#repLocFrm");
				mapFunc('GeofenceMapRemoveMap');
				
				$("#iptRepLocPortCd").val(portCd);
			}
		}
		Util.confirm({ title: '정보를 다시 입력하시겠습니까?', icon: 'warning' }, confirmFunc);
	},
	deleteLoc: function(){
		let _t = this;
		let _locGeoGrid = _t.getLocGeoGrid();
		let _portCd;
		let _locCdPortTypeList;

		if( !$('#locGeoList').hasClass('hide')) {
			let _rows = _locGeoGrid.getGrid().getCheckedRows();

			if ( _length(_rows) < 1 ) {
				Util.alert({ title: '데이터를 선택하세요', icon: 'warning' })
				return false;
			} else {	
				_portCd = _get(_head(_rows), 'PORT_CD');
				_locCdPortTypeList = _map(_rows, (i) => {
					return {
						LOC_CD: _get(i, 'LOC_CD'),
						PORT_TYPE: _get(i, 'PORT_TYPE')
					};
				});
			}
		} else {
			_portCd = $('#iptLocPortCd').val();
			_locCdPortTypeList = [ { LOC_CD: $('#iptLocCd').val(), PORT_TYPE:$('#selPortType').val() } ];
		}

		if( !_isNull(_portCd) && !_isNull(_locCdPortTypeList) ) { 

			let confirmFunc = function(res){
				let headers = {
					contentType: 'application/json'
				};
	
				if ( res.isConfirmed ) {
					let parm = JSON.stringify({ PORT_CD: _portCd, locCdPortTypeList: _locCdPortTypeList })
					let url = apiUrl.GEOFENCE_DEL_LOC_URL;
					let updPort = function(res){
						Util.alert({ title: res.msg, icon: res.status })
						_t.goLocList(_portCd);
	
						mapFunc('GeofenceUpdateData');
					};
					Api.postApi(url, parm, updPort, headers);
				}
			}
			Util.confirm({ title: '해당 데이터를 삭제하시겠습니까?', icon: 'warning' }, confirmFunc);
		}
	},
	//hanmin
	deleteRepLoc: function(){
		let _t = this;
		let _repLocGeoGrid = _t.getRepLocGeoGrid();
		let _repPortCd;
		let _repLocCdPortTypeList;

		if( !$('#repLocGeoList').hasClass('hide')) {
			let _rows = _repLocGeoGrid.getGrid().getCheckedRows();

			if ( _length(_rows) < 1 ) {
				Util.alert({ title: '데이터를 선택하세요', icon: 'warning' })
				return false;
			} else {	
				_repPortCd = _get(_head(_rows), 'PORT_CD');
				_repLocCdPortTypeList = _map(_rows, (i) => {
					return {
						LOC_CD: _get(i, 'LOC_CD'),
						PORT_TYPE: _get(i, 'PORT_TYPE')
					};
				});
			}
		} else {
			_repPortCd = $('#iptRepLocPortCd').val();
			_repLocCdPortTypeList = [ { LOC_CD: $('#iptRepLocCd').val(), PORT_TYPE:$('#selRepPortType').val() } ];
		}

		if( !_isNull(_repPortCd) && !_isNull(_repLocCdPortTypeList) ) { 

			let confirmFunc = function(res){
				let headers = {
					contentType: 'application/json'
				};
	
				if ( res.isConfirmed ) {
					let parm = JSON.stringify({ PORT_CD: _repPortCd, repLocCdPortTypeList: _repLocCdPortTypeList })
					let url = apiUrl.GEOFENCE_DEL_LOC_URL;
					let updPort = function(res){
						Util.alert({ title: res.msg, icon: res.status })
						_t.goRepLocList(_repPortCd);
	
						mapFunc('GeofenceUpdateData');
					};
					Api.postApi(url, parm, updPort, headers);
				}
			}
			Util.confirm({ title: '해당 데이터를 삭제하시겠습니까?', icon: 'warning' }, confirmFunc);
		}
	},
	copyLoc: function(){
		let _t = this;
		let _locGeoGrid = _t.getLocGeoGrid();
		let _modalGridForCopyGeo = _t.getModalGridForCopyGeo();

		let _portCd, _otherPortCd;
		let _locCdPortTypeList;

		if( !$('#locGeoList').hasClass('hide')) { // loc list에서 복사 
			let _rows = _locGeoGrid.getGrid().getCheckedRows();
			let _modalRows = _modalGridForCopyGeo.getGrid().getCheckedRows();

			
			if ( _length(_rows) < 1 ) {
				Util.alert({ title: '데이터를 선택하세요', icon: 'warning' })
				return false;
			}
			else {
				/**  _otherPortCd가 null일 경우 현재 조회한 port에 복제 */
				// if ( _length(_modalRows) < 1 ) {
				// 	Util.alert({ title: 'Port를 선택하세요', icon: 'warning' })
				// 	return false;
				// }
				_otherPortCd = _get(_head(_modalRows), 'PORT_CD');
				_portCd = _get(_head(_rows), 'PORT_CD');
				_locCdPortTypeList = _map(_rows, (i) => {
					return {
						LOC_CD: _get(i, 'LOC_CD'),
						PORT_TYPE: _get(i, 'PORT_TYPE')
					};
				});
				
			}
		}
		else{
			_portCd = $('#iptLocPortCd').val();
			_locCdPortTypeList = [ { LOC_CD: $('#iptLocCd').val(), PORT_TYPE:$('#selPortType').val() } ];
		}

		if( !_isNull(_portCd) && !_isNull(_locCdPortTypeList) ) { 

			let confirmFunc = function(res){
				let headers = {
					contentType: 'application/json'
				};

				if ( res.isConfirmed ) {
					let parm = JSON.stringify({ PORT_CD: _portCd, OTHER_PORT_CD: _otherPortCd, locCdPortTypeList: _locCdPortTypeList })
					let url = apiUrl.GEOFENCE_DUP_LOC_URL;
					let updPort = function(res){
						Util.alert({ title: res.msg, icon: res.status })
						_t.goLocList(_otherPortCd ? _otherPortCd : _portCd);

						mapFunc('GeofenceUpdateData');
					};
					Api.postApi(url, parm, updPort, headers);
					$('#iptCopyPortCd').val("");
					_t.hideModal("#copyModal");
				}
			}
			Util.confirm({ title: '해당 데이터를 복사하시겠습니까?', icon: 'warning' }, confirmFunc);
		}
	},
	//hanmin
	copyRepLoc: function(){
		let _t = this;
		let _locGeoGrid = _t.getLocGeoGrid();
		let _modalGridForCopyGeo = _t.getModalGridForCopyGeo();

		let _portCd, _otherPortCd;
		let _locCdPortTypeList;

		if( !$('#repLocGeoList').hasClass('hide')) { // loc list에서 복사 
			let _rows = _locGeoGrid.getGrid().getCheckedRows();
			let _modalRows = _modalGridForCopyGeo.getGrid().getCheckedRows();

			
			if ( _length(_rows) < 1 ) {
				Util.alert({ title: '데이터를 선택하세요', icon: 'warning' })
				return false;
			}
			else {
				/**  _otherPortCd가 null일 경우 현재 조회한 port에 복제 */
				// if ( _length(_modalRows) < 1 ) {
				// 	Util.alert({ title: 'Port를 선택하세요', icon: 'warning' })
				// 	return false;
				// }
				_otherPortCd = _get(_head(_modalRows), 'PORT_CD');
				_portCd = _get(_head(_rows), 'PORT_CD');
				_locCdPortTypeList = _map(_rows, (i) => {
					return {
						LOC_CD: _get(i, 'LOC_CD'),
						PORT_TYPE: _get(i, 'PORT_TYPE')
					};
				});
				
			}
		}
		else{
			_portCd = $('#iptRepLocPortCd').val();
			_locCdPortTypeList = [ { LOC_CD: $('#iptLocCd').val(), PORT_TYPE:$('#selRepPortType').val() } ];
		}

		if( !_isNull(_portCd) && !_isNull(_locCdPortTypeList) ) { 

			let confirmFunc = function(res){
				let headers = {
					contentType: 'application/json'
				};

				if ( res.isConfirmed ) {
					let parm = JSON.stringify({ PORT_CD: _portCd, OTHER_PORT_CD: _otherPortCd, locCdPortTypeList: _locCdPortTypeList })
					let url = apiUrl.GEOFENCE_DUP_LOC_URL;
					let updPort = function(res){
						Util.alert({ title: res.msg, icon: res.status })
						_t.goLocList(_otherPortCd ? _otherPortCd : _portCd);

						mapFunc('GeofenceUpdateData');
					};
					Api.postApi(url, parm, updPort, headers);
					$('#iptCopyPortCd').val("");
					_t.hideModal("#copyModal");
				}
			}
			Util.confirm({ title: '해당 데이터를 복사하시겠습니까?', icon: 'warning' }, confirmFunc);
		}
	},
	moveLoc: function(){
		let _t = this;
		let _locGeoGrid = _t.getLocGeoGrid();
		let _modalGridForMoveGeo = _t.getModalGridForMoveGeo();

		let _portCd, _otherPortCd;
		let _locCdPortTypeList;

		
		let _rows = _locGeoGrid.getGrid().getCheckedRows();
		let _modalRows = _modalGridForMoveGeo.getGrid().getCheckedRows();

		if ( _length(_rows) < 1 ) {
			Util.alert({ title: '데이터를 선택하세요', icon: 'warning' })
			return false;
		}
		else {	
			if ( _length(_modalRows) < 1 ) {
				Util.alert({ title: 'Port를 선택하세요', icon: 'warning' })
				return false;
			} else {
				_otherPortCd = _get(_head(_modalRows), 'PORT_CD');
				_portCd = _get(_head(_rows), 'PORT_CD');
				_locCdPortTypeList = _map(_rows, (i) => {
					return {
						LOC_CD: _get(i, 'LOC_CD'),
						PORT_TYPE: _get(i, 'PORT_TYPE')
					};
				});
			}

		}
		
		if( !_isNull(_portCd) && !_isNull(_locCdPortTypeList) ) { 

			let confirmFunc = function(res){
				let headers = {
					contentType: 'application/json'
				};

				if ( res.isConfirmed ) {
					let parm = JSON.stringify({ PORT_CD: _portCd, OTHER_PORT_CD: _otherPortCd, locCdPortTypeList: _locCdPortTypeList })
					let url = apiUrl.GEOFENCE_MOVE_LOC_URL;
					let updPort = function(res){
						Util.alert({ title: res.msg, icon: res.status })
						_t.goLocList(_otherPortCd ? _otherPortCd : _portCd);

						mapFunc('GeofenceUpdateData');
					};
					Api.postApi(url, parm, updPort, headers);
					$('#iptMovePortCd').val("");
					_t.hideModal("#moveModal");
				}
			}
			Util.confirm({ title: '해당 데이터를 이동시키겠습니까?', icon: 'warning' }, confirmFunc);
		}
	},
  	setRepPortForm: function(data){
		$("#iptRepPort").val(_get(data, 'REP_PORT'));
		$("#iptRepData").val(parsingGeoData(_get(data, 'PORT_GEO')));
		$("#iptRepLat").val(_get(data, 'LOC_LAT'));
		$("#iptRepLon").val(_get(data, 'LOC_LON'));
		$("#iptCreUsrId").val(_get(data, 'CRE_USR_ID'));
		$("#iptCreDt").val(_get(data, 'CRE_DT'));
		$("#iptUpdUsrId").val(_get(data, 'UPD_USR_ID'));
		$("#iptUpdDt").val(_get(data, 'UPD_DT'));
		$("#iptRegUsrNo").val(_get(data, 'REG_USR_NO'));
		$("#iptRegDt").val(_get(data, 'REG_DT'));
		$("#iptUpdUsrNo").val(_get(data, 'UPD_USR_NO'));
	},
	setPortForm: function(data){
		$("#iptPortCd").val(_get(data, 'PORT_CD'));
		$("#iptPortNm").val(_get(data, 'PORT_NM'));
		$("#iptUnlocode").val(_get(data, 'UN_LOC_CD'));
		$("#iptPortGeoData").val(parsingGeoData(_get(data, 'PORT_GEO')));
		$("#selRepPort").val(_get(data, 'REP_PORT_CD')).prop("selected", true);
		$("#iptPortLat").val(_get(data, 'LOC_LAT'));
		$("#iptPortLon").val(_get(data, 'LOC_LON'));
		$("#selPortGeoType").val(_get(data, 'PORT_TYPE')).prop("selected", true);
		$("#iptPortGeoData").attr("disabled", false);
		$("#isValidPortCd").prop("checked", true);
	},
	setLocForm: function(data){
		$("#iptLocPortCd").val(_get(data, 'PORT_CD'));
		$("#iptLocCd").val(_get(data, 'LOC_CD'));
		$("#iptLocNm").val(_get(data, 'LOC_NAME'));
		$("#selPortType").val(_get(data, 'PORT_TYPE'));
		$("#selAreaKind").val(_get(data, 'AREA_KIND'));
		$("#selGeoTypeCd").val(_get(data, 'DATA_TYPE'));
		$("#iptLocGeoData").val(parsingGeoData(_get(data, 'LOC_GEO')));
		$("#iptRadius").val(_get(data, 'RAD_SIZE'));

		$("#iptLocLat").val(_get(data, 'LOC_LAT'));
		$("#iptLocLon").val(_get(data, 'LOC_LON'));
		$("#iptLocDwt").val(_get(data, 'DWT_LMT'));
		$("#iptLocDraft").val(_get(data, 'DRAFT_LMT'));

		$("#iptLocGeoData").attr("disabled", false);
		
		// chkDefaultYn : data.defaultYn
		if ("Y" == _get(data, 'DEFAULT_YN')) {
			$("input[name='chkDefaultYn']").prop("checked", true);
		} else {
			$("input[name='chkDefaultYn']").prop("checked", false);
		}
		if ("C" == _get(data, 'DATA_TYPE')) {
			$("#iptRadius").parent().parent().removeClass("d-none");
		} else {
			$("#iptRadius").parent().parent().addClass("d-none");
		}
	},
	setRepLocForm: function(data){
		$("#iptRepLocPortCd").val(_get(data, 'REP_PORT_CD'));
		$("#iptRepLocCd").val(_get(data, 'LOC_CD'));
		$("#iptRepLocNm").val(_get(data, 'LOC_NAME'));
		$("#selRepPortType").val(_get(data, 'PORT_TYPE'));
		$("#selRepAreaKind").val(_get(data, 'AREA_KIND'));
		$("#selRepGeoTypeCd").val(_get(data, 'DATA_TYPE'));
		$("#iptRepLocGeoData").val(parsingGeoData(_get(data, 'LOC_GEO')));
		$("#iptRepRadius").val(_get(data, 'RAD_SIZE'));

		$("#iptRepLocLat").val(_get(data, 'LOC_LAT'));
		$("#iptRepLocLon").val(_get(data, 'LOC_LON'));
		$("#iptRepLocDwt").val(_get(data, 'DWT_LMT'));
		$("#iptRepLocDraft").val(_get(data, 'DRAFT_LMT'));

		$("#iptLocGeoData").attr("disabled", false);
		
		// chkDefaultYn : data.defaultYn
		if ("Y" == _get(data, 'DEFAULT_YN')) {
			$("input[name='chkDefaultYn']").prop("checked", true);
		} else {
			$("input[name='chkDefaultYn']").prop("checked", false);
		}
		if ("C" == _get(data, 'DATA_TYPE')) {
			$("#iptRadius").parent().parent().removeClass("d-none");
		} else {
			$("#iptRadius").parent().parent().addClass("d-none");
		}
	},
	redrawGeoData: function(selector, state){
		let geoData = $(selector).val().replace(/\s/g, '');

		let parm = { geoData: geoData };
		
		mapFunc('GeofenceMapRemoveMap');

		if(state == 'LOCATION'){
			this.drawLocGeo(parm)
		}
		else{
			this.drawPortGeo(parm);
		}
		if( !_isNull(geoData) ){
			setTimeout(()=>{
				mapFunc('GeofenceMapRedrawLayer', { selector: selector });
			}, 30)
		}
	},
	drawGeoData: function(selector, state){
		$(selector).val('');
  
		if( state === 'LOCATION' ) isSelectedGeoType();
		var type = state === 'LOCATION' ? $("#selGeoTypeCd").val() : "P";

		mapFunc('GeofenceMapRemoveMap');
  
		mapFunc('GeofenceMapDrawLayer', { state: state, selector: selector, type: type });
	},
	//hanmin
	drawRepGeoData: function(selector, state){
		$(selector).val('');
  
		if( state === 'LOCATION' ) isSelectedRepGeoType();
		var type = state === 'LOCATION' ? $("#selRepGeoTypeCd").val() : "P";

		mapFunc('GeofenceMapRemoveMap');
  
		mapFunc('GeofenceMapDrawLayer', { state: state, selector: selector, type: type });
	},
	drawPortGeo: function(args){
		let _geoData  = _get(args, 'geoData'),
				_latlon   = _get(args, 'latlonData'),
				_label    = _get(args, 'label');

		if( !_isNull(_geoData) && _geoData != '' ){
			mapFunc('GeofenceMapAddLayer', { geoData: _geoData, state: 'PORT'});
		}
		if( !_isNull(_get(_latlon, 'lat')) && !_isNull(_get(_latlon, 'lon')) ){
			mapFunc('GeofenceMapAddPort', { latlng: _latlon, portCd: _label });
		}
		mapFunc('CommapSetBounds')
	},
	drawLocGeo: function(args){
		let _geoData = _get(args, 'geoData'),
				_latlon  = _get(args, 'latlonData'),
				_label   = _get(args, 'label'),
				_key     = _get(args, 'key')

		if( !_isNull(_geoData) && _geoData != '' ){
			mapFunc('GeofenceMapAddLayer', { geoData: _geoData, state: 'LOCATION', label: _label, rowKey: _nvl(_key, 0) });
		}
		if( !_isNull(_get(_latlon, 'lat')) && !_isNull(_get(_latlon, 'lon')) ){
			mapFunc('GeofenceMapAddPort', { latlng: _latlon, portCd: _label, rowKey: _key });
		}
		mapFunc('CommapSetBounds')
	},
}

let mapFunc = function(fncName, parm){
    var frame = document.querySelector('#mapIframe').contentWindow;
    frame.postMessage({ functionName : fncName, params: [parm] }, '*' );
  }

  
/**
 *  map에 그려진 GeoData와 Radius를 입력하는 함수
 */
function updateInputGeoData(data) {
	// debugger;
	$(data.selector).val(parsingGeoData(data.geoData));

	if( !_isNull(data.radius) ){
		$("#iptRadius").val(data.radius);
	}
}

function setMapBounds(data){}

/**
* Location의 'Draw Data'버튼 클릭 전 필수 확인 함수 
* @returns {boolean} data type 선택 여부
*/
var isSelectedGeoType = function(){
    var type = $("#selGeoTypeCd").val();

    if( !type ){
	  Util.alert({ title: '도형 타입을 선택하세요.', icon: 'warning' })
      $('#selGeoTypeCd').focus();
      return false;
    }
    return true;
}
//hanmin
var isSelectedRepGeoType = function(){
    var type = $("#selRepGeoTypeCd").val();

    if( !type ){
	  Util.alert({ title: '도형 타입을 선택하세요.', icon: 'warning' })
      $('#selRepGeoTypeCd').focus();
      return false;
    }
    return true;
}
/**
 * GeoData JSON 정렬
 */

var parsingGeoData = function(data) {

	var jsonObject = JSON.parse(data);
	var formattedJsonString = JSON.stringify(jsonObject, null, 1);

	return formattedJsonString;
}