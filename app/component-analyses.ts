import { ApiLocator } from './index';

export class ComponentAnalyses {

    private stackApiUrl: string;
    private api: ApiLocator = new ApiLocator();
    private token: string;

    constructor() {
        this.stackApiUrl = this
            .api
            .buildApiUrl(STACK_API_URL, 'recommender.api', 'api/v1');
    }

    formCardData = (compAnalysesArray: any) => {
        if (compAnalysesArray.data[0].hasOwnProperty("version") &&
            compAnalysesArray.data[0].hasOwnProperty("package")) {
            this.formStackCardSummary(compAnalysesArray);
            this.formStackCardVersion(compAnalysesArray);
            this.formStackCardCodeMetric(compAnalysesArray);
            if (compAnalysesArray.data[0].version.hasOwnProperty('cve_ids')) {
                $('#compGridCntrCVE').show();
                this.buildCveList(compAnalysesArray.data[0].version.cve_ids);
            }
        }
    }

    formStackCardSummary = (compAnalysesArray: any) => {
        let cardDataSetSummary: Array<any> = [];
        let cardDataSetObjSummary: any = {};
        let compAnalysesArrayData = compAnalysesArray.data[0];
        cardDataSetObjSummary.alias = "Ecosystem";
        cardDataSetObjSummary.value = compAnalysesArrayData.version.pecosystem[0];
        cardDataSetObjSummary.icon = "fa-cube";
        cardDataSetSummary.push(cardDataSetObjSummary);
        cardDataSetObjSummary = {};
        cardDataSetObjSummary.alias = "Name";
        cardDataSetObjSummary.value = compAnalysesArrayData.version.pname[0];
        cardDataSetObjSummary.icon = "fa-info";
        cardDataSetSummary.push(cardDataSetObjSummary);
        cardDataSetObjSummary = {};
        cardDataSetObjSummary.alias = "Dependencies";
        cardDataSetObjSummary.value = compAnalysesArrayData.version.dependents_count[0] > 0 ?
            compAnalysesArray.version.dependents_count[0] : "NA";
        cardDataSetObjSummary.icon = "fa-cubes";
        cardDataSetSummary.push(cardDataSetObjSummary);
        this.buildStackCardTemplate(cardDataSetSummary, "summary-card-contents", 4);
    }

    formStackCardVersion = (compAnalysesArray: any) => {
        let cardDataSetSummary: Array<any> = [];
        let cardDataSetObjSummary: any = {};
        let compAnalysesArrayData = compAnalysesArray.data[0];
        let compAnalysesRecommend = compAnalysesArray.recommendation;
        cardDataSetObjSummary.alias = "Current";
        cardDataSetObjSummary.value = compAnalysesArrayData.version.version[0];
        cardDataSetObjSummary.icon = "fa-star";
        cardDataSetSummary.push(cardDataSetObjSummary);
        cardDataSetObjSummary = {};
        cardDataSetObjSummary.alias = "Latest";
        cardDataSetObjSummary.value = compAnalysesArrayData.package.latest_version[0] || "NA";
        cardDataSetObjSummary.icon = "fa-star";
        cardDataSetSummary.push(cardDataSetObjSummary);
        cardDataSetObjSummary = {};
        cardDataSetObjSummary.alias = "Recommended";
        cardDataSetObjSummary.value = compAnalysesRecommend.hasOwnProperty('change_to') ? compAnalysesRecommend.change_to : "NA";
        cardDataSetObjSummary.icon = "fa-check-square-o";
        cardDataSetSummary.push(cardDataSetObjSummary);
        this.buildStackCardTemplate(cardDataSetSummary, "version-card-contents", 4);
    }

    formStackCardCodeMetric = (compAnalysesArray: any) => {
        let cardDataSetSummary: Array<any> = [];
        let cardDataSetObjSummary: any = {};
        let compAnalysesArrayData = compAnalysesArray.data[0];
        cardDataSetObjSummary.alias = "Lines of code";
        cardDataSetObjSummary.value = compAnalysesArrayData.version.cm_loc[0] > 0 ?
            compAnalysesArrayData.version.cm_loc[0] : "NA";
        cardDataSetObjSummary.icon = "fa-code";
        cardDataSetSummary.push(cardDataSetObjSummary);
        cardDataSetObjSummary = {};
        cardDataSetObjSummary.alias = "Cyclomatic Complexity";
        cardDataSetObjSummary.value = compAnalysesArrayData.version.cm_avg_cyclomatic_complexity[0] > 0 ?
            compAnalysesArrayData.version.cm_avg_cyclomatic_complexity[0] : "NA";
        cardDataSetObjSummary.icon = "fa-circle";
        cardDataSetSummary.push(cardDataSetObjSummary);
        cardDataSetObjSummary = {};
        cardDataSetObjSummary.alias = "Number Of Files";
        cardDataSetObjSummary.value = compAnalysesArrayData.version.cm_num_files[0] > 0 ?
            compAnalysesArrayData.version.cm_num_files[0] : "NA";
        cardDataSetObjSummary.icon = "fa-file-code-o";
        cardDataSetSummary.push(cardDataSetObjSummary);
        this.buildStackCardTemplate(cardDataSetSummary, "codemetric-card-contents", 4);
    }

    buildCveList = (compAnalysesCVE: any) => {
        $('#cve-card-contents').empty();
        for (let i in compAnalysesCVE) {
            let dataSetCveIDScore: Array<any> = [];
            dataSetCveIDScore = compAnalysesCVE[i].split(':');
            if (dataSetCveIDScore[1] > 7){
                //var strToAdd = `<li class="list-group-item"><span><img class="comp-cve-icon" src="../assets/images/dangerCVE.png"></img> ${dataSetCveIDScore[0]} , CVSS score of ${dataSetCveIDScore[1]}</span></li>`;
                var strToAdd = `<div class="list-view-pf-main-info">
                          <div class="list-view-pf-left">
                            <span class="pficon pficon-warning-triangle-o danger-icon-cve"></span>
                          </div>
                          <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                              <div class="list-group-item-text pull-left">
                                 ${dataSetCveIDScore[0]} , CVSS score of ${dataSetCveIDScore[1]}
                              </div>
                            </div>
                          </div>
                        </div>`;
            } else {
                var strToAdd = `<div class="list-view-pf-main-info">
                          <div class="list-view-pf-left">
                            <span class="pficon pficon-warning-triangle-o warning-icon-cve"></span>
                          </div>
                          <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                              <div class="list-group-item-text pull-left">
                                 ${dataSetCveIDScore[0]} , CVSS score of ${dataSetCveIDScore[1]}
                              </div>
                            </div>
                          </div>
                        </div>`;
                //var strToAdd = `<li class="list-group-item"><span><img class="comp-cve-icon" src="../assets/images/warningCVE.png"></img> ${dataSetCveIDScore[0]} , CVSS score of ${dataSetCveIDScore[1]}</span></li>`;
            }
            $('#cve-card-contents').append(strToAdd);

        }
    }

    buildStackCardTemplate = (cardDataSetSummary: any, cardcontentId: any, classGrid: any) => {
        $('#' + cardcontentId).empty();
        for (var i in cardDataSetSummary) {
            var strToAdd = `<div class="col-md-${classGrid}">
                            <div class="row f8-icon-size overview-code-metric-icon">
                                <i class="fa ${cardDataSetSummary[i].icon}"></i>
                            </div>
                            <div class="row f8-chart-numeric">
                                ${cardDataSetSummary[i].value}
                            </div>
                            <div class="row f8-chart-description">
                                <p>${cardDataSetSummary[i].alias}</p>
                            </div>
                            </div>`;
            $('#' + cardcontentId).append(strToAdd);
        }
    }

    fetchCompAnalysis = (ecosystem: string, component: string, version: any) => {
        let stackUri = this.stackApiUrl;
        let compAnalysesArray: Array<any>;
        $('#componentSpinner').show();
        $('#componentStatusMsg').text('');
        $('#compGridCntrCVE').hide();
        // this.token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIwbEwwdlhzOVlSVnFaTW93eXc4dU5MUl95cjBpRmFvemRRazlyenEyT1ZVIn0.eyJqdGkiOiJlYjYwN2Y3Ni1hOWQxLTRmZmQtOTM3Ni03ZWQ5ZWYxYTc0MzUiLCJleHAiOjE0OTU4NzkxNzIsIm5iZiI6MCwiaWF0IjoxNDkzMjg3MTcyLCJpc3MiOiJodHRwczovL3Nzby5vcGVuc2hpZnQuaW8vYXV0aC9yZWFsbXMvZmFicmljOCIsImF1ZCI6ImZhYnJpYzgtb25saW5lLXBsYXRmb3JtIiwic3ViIjoiY2JlYjE0MWMtMmRlYy00ODUyLWFlMjktYzZjOWIzZTIzMGMxIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZmFicmljOC1vbmxpbmUtcGxhdGZvcm0iLCJhdXRoX3RpbWUiOjE0OTMyODY4NzcsInNlc3Npb25fc3RhdGUiOiIyZGU0YzU3NC00MTQ2LTQxODItODM0NC1kNDI5NGE0YTY2NDgiLCJuYW1lIjoiQXJ1bmt1bWFyIFMiLCJnaXZlbl9uYW1lIjoiQXJ1bmt1bWFyIiwiZmFtaWx5X25hbWUiOiJTIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2FpbGFydW5rdW1hciIsImVtYWlsIjoic2FpbC5hcnVua3VtYXJAZ21haWwuY29tIiwiYWNyIjoiMCIsImNsaWVudF9zZXNzaW9uIjoiM2ZmNTNiMDMtMjA0ZS00M2YzLTkxNTUtNjNjYjYwYzVmNDdlIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYnJva2VyIjp7InJvbGVzIjpbInJlYWQtdG9rZW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sImF1dGhvcml6YXRpb24iOnsicGVybWlzc2lvbnMiOlt7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiYzk3MGI4MzQtOTRjNi00OTYwLWE0MGUtNmY2ZGM0MTQ0YjQ5IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI0ZGY5MzkyYi05Mzc3LTQ2NDYtYjZkOC0yNTlkM2Y4NGQ4MTcifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiMzc0MmM0YzYtNDc4ZS00MmQzLTgzNTQtNGQ4M2ZjM2Y5NjhhIiwicmVzb3VyY2Vfc2V0X25hbWUiOiJiY2RkODQzNi00MjVhLTQzOGItODY4MS01ZjliZjZkYTYwNGUifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiMmIyMDM0MGYtNTNkMi00ZDRkLTgwMDgtZTQ2MmQ2YzYzOGM4IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI0ZDk3OTU2Ny1mMmVhLTRiM2YtOWE1Mi05NDU1NGE5NTU3M2MifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiNDc5ZWY2OWEtMDczNy00NmUyLTliY2QtZWE1MWNkNTQ3NzM4IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI1MWM3NzQ3MS0yZDUyLTRjMDYtOTY1YS1jZjYwNWUwMjc4YzQifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiZTVlNDExMzAtY2VmNS00YWM2LWJkN2ItMzUyZDI5MjM2ZDExIiwicmVzb3VyY2Vfc2V0X25hbWUiOiJmMTVlY2MxZC04NWRlLTQzYTQtOTk3MC1jZGE3NWRkZDYyOWMifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiN2Y4ZjQ4YTMtMDRiOC00YmFmLTg2YmQtYmE3MzBjMzEwYzc5IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI4NTZmNDA2NC0zNDYwLTQyNDItYWZjYy01MDBkNWMxYjdkMzIifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiOWRkZmE4Y2ItYWRiNi00NGI4LThmMDAtZTMwMmM1MWFiY2NiIiwicmVzb3VyY2Vfc2V0X25hbWUiOiJmYjk4MmUyNi01MzhlLTRlNjEtYmU4My1jOWM0OTY0YTQ4NmIifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiZTRkYjVlMzUtNjNiZC00MjkxLTk0ZmItNjBhM2UxMzU2OGM0IiwicmVzb3VyY2Vfc2V0X25hbWUiOiJmODYzZWE5Yi1iMzI0LTQwNjctYjQ5Ny1lN2FmNzdjY2EwMmYifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiMTNkNTY4YmMtYTA4NC00ZGY2LWFkOWQtODg3MTg2OTc2NzM3IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI1YWY2YmUyYy1lYjNkLTQzZDMtYTVlYi04MjRlOWE4N2JjMWIifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiOTk0MTQ5NmMtZmI2Mi00ODQzLWE4YzItOTIwYmZlNDY5YWEzIiwicmVzb3VyY2Vfc2V0X25hbWUiOiI3MTVmNDI1OS1lZTNjLTQ0OTItOTVhMC1jNjM5M2FjZmFlZmIifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiODUzN2M3YWMtNmYwMy00YTMyLWE5OGUtM2EyYjQ5OTllMGY0IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI1YzFkNzMzNC02NjRmLTQyMDktYjEwMy1hNzBjZmQ0NTQxNmEifV19LCJjb21wYW55IjoiUmVkaGF0In0.BlMxjuHkfRuF8rTdtmkcurQ8BcaBekCXn2eu1FfUMtc7fOGm75Lm3unjnswNt5PNtCS_Qfi95jG4yNmsZ2h3AMfScJu5CLzYCG8fg-bzfYKNR4HOFmvUUvRHEW7Fgo8QsLzM7P0Kw2AOKcdt1E2jMduRtkaCAteMrALjfIm-1A2TTv7-Q_0I_WqHfRwfOj73WSNkP2vFpjd7jUQTKjR4KLx0mMU5-jDNGRIRKfloyfjbW42xm8pwV3M9Xbo10s12DQl0dxYuZHbQBL7gULke7827Yra2CmYAUEKqTgMf8O45iyiLbD9qyI8S_aDNz8R23krHH-Z_j1R2q_MG73OpGw';
        
        $.ajax({
            url: stackUri + 'component-analyses/' + ecosystem + '/' + component + '/' + version,
            method: 'GET',
            headers: { "Authorization": 'Bearer ' + this.token },
            success: response => {
                if (response && response.result && response.result.data) {
                    compAnalysesArray = response.result;
                    $('#compGridCntr').show();
                    $('#componentStatus').hide();
                    $('#componentSpinner').hide();
                    this.formCardData(compAnalysesArray);
                } else {
                    $('#compGridCntr').hide();
                    $('#compGridCntrCVE').hide();
                    $('#componentStatus').show();
                    $('#componentStatusMsg').text('No records found for this component');
                    $('#componentSpinner').hide();
                }
            },
            error: () => {
                $('#componentSpinner').hide();
                $('#compGridCntr').hide();
                $('#compGridCntrCVE').hide();
                $('#componentStatus').show();
                $('#componentStatusMsg').text('Our records could not match this search');
            }
        });
    }

    buildComponentAnalyses = (authToken: string) => {
        let stackUri = this.stackApiUrl;
        this.token = authToken;
        let ecosystem: string = '';
        let component: string = '';
        let version: string = '';
        $('#compGridCntr').hide();
        $('#tableCompResult').hide();
        $('#searchListView').hide();
        $('#compGridCntrCVE').hide();
        $('#componentStatus').hide();
        $('#componentSpinner').hide();
        $('#tabCompBody').on('click', (event) => {
            event.preventDefault();
            if ($(event.target).hasClass('comp-name')) {
                let ecosystem = event.target.getAttribute('data-ecosystem');
                let component = event.target.getAttribute('data-component');
                let version = event.target.getAttribute('data-version');
                this.fetchCompAnalysis(ecosystem, component, version);
            }
        });
        $("#componentanalysesform").submit((val: any) => {
            component = $("#component").val();
            $('#componentSpinner').show();
            $('#componentStatusMsg').text('');
            $('#compGridCntr').hide();
            $.ajax({
                url: stackUri + 'package-search?package=' + component,
                method: 'GET',
                headers: { "Authorization": 'Bearer ' + this.token},
                success: response => {
                    let responseData = JSON.parse(response);
                    $('#componentSpinner').hide();
                    if (responseData && responseData.hasOwnProperty('result') && responseData.result.length > 0) {
                        $('#searchListView').hide();
                        $('#tableCompResult').show();
                        $('#tabCompBody').empty();
                        let searchList = responseData.result;
                        for (var item in searchList) {
                            var strToAdd = `<tr>
                                                <td class="first-cap">${searchList[item].ecosystem}</td>
                                                <td><a class="comp-name" href="#"
                                                        data-ecosystem=${searchList[item].ecosystem}
                                                        data-component=${searchList[item].name}
                                                        data-version=${searchList[item].version}>
                                                    ${searchList[item].name}</a></td>
                                                <td>${searchList[item].version}</td>
                                            </tr>`
                            $('#tabCompBody').append(strToAdd);
                        }
                    } else {
                        $('#tableCompResult').hide();
                        $('#searchListView').show();
                        $('#searchListView').html('');
                        let strToAdd = `<div class="list-view-pf-main-info">
                          <div class="list-view-pf-left">
                            <span class="pficon pficon-warning-triangle-o"></span>
                          </div>
                          <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                              <div class="list-group-item-text">
                               <b>We don't have any matching result.</b> Try something else!
                              </div>
                            </div>
                          </div>
                        </div>`;
                        $('#searchListView').append(strToAdd);
                    }
                },
                error: () => {
                    $('#componentSpinner').hide();
                    $('#compGridCntr').hide();
                    alert("Failure");
                }
            });
            event.preventDefault();
        });
        $("#componentanalysesform-1").submit((val: any) => {

            event.preventDefault();
        });
    }

}