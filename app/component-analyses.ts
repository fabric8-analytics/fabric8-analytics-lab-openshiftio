import * as Socket from 'socket.io-client';
import { ApiLocator } from './index';

export class ComponentAnalyses {

    private stackApiUrl: string;
    private api: ApiLocator = new ApiLocator();
    private token: string;
    private component_list_endpoint: string = '/component-list';
    private component_analyses_endpoint: string = '/component-analyses';

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
            if (dataSetCveIDScore[1] > 7) {
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
        $('#sentimentScoreCard').hide();
        let socket = Socket.connect('http://127.0.0.1:5012' + this.component_analyses_endpoint);
        socket.on('connect', function () {
            socket.emit('get_component_analyses', 'Call to fetch component analyses data');
        });
        socket.on('component-analyses-response', (response: any) => {
            let responseData = JSON.parse(response);
                responseData = responseData.result;
            if (responseData && responseData.result) {
                compAnalysesArray = responseData.result;
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
        });
        socket.on('component-sentiment-response', (response: any) => {
            $('#sentimentScoreCard').show();
            let responseData = JSON.parse(response);
            let sentimentObj = responseData.result;
            $('#average-sentiment-score').html(sentimentObj.sentiment_details.sentiment.score);
            $('#latest-sentiment-score').html(sentimentObj.sentiment_details.latest_comment_details.score);
        });
        // $.ajax({
        //     url: stackUri + 'component-analyses/' + ecosystem + '/' + component + '/' + version,
        //     method: 'GET',
        //     headers: { "Authorization": 'Bearer ' + this.token },
        //     success: response => {
        //         if (response && response.result && response.result.data) {
        //             compAnalysesArray = response.result;
        //             $('#compGridCntr').show();
        //             $('#componentStatus').hide();
        //             $('#componentSpinner').hide();
        //             this.formCardData(compAnalysesArray);
        //         } else {
        //             $('#compGridCntr').hide();
        //             $('#compGridCntrCVE').hide();
        //             $('#componentStatus').show();
        //             $('#componentStatusMsg').text('No records found for this component');
        //             $('#componentSpinner').hide();
        //         }
        //     },
        //     error: () => {
        //         $('#componentSpinner').hide();
        //         $('#compGridCntr').hide();
        //         $('#compGridCntrCVE').hide();
        //         $('#componentStatus').show();
        //         $('#componentStatusMsg').text('Our records could not match this search');
        //     }
        // });
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
        $('#sentimentScoreCard').hide();
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
            event.preventDefault();
            let socket = Socket.connect('http://127.0.0.1:5012' + this.component_list_endpoint);
            socket.on('connect', function () {
                socket.emit('get_component_list', 'Call to fetch component list');
            });
            socket.on('component-list-response', function (response: any) {
                let responseData = JSON.parse(response);
                responseData = responseData.result;
                $('#componentSpinner').hide();
                if (responseData && responseData.result) {
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
            });
            //     $.ajax({
            //         url: stackUri + 'package-search?package=' + component,
            //         method: 'GET',
            //         //headers: { "Authorization": 'Bearer ' + this.token},
            //         success: response => {
            //             let responseData = JSON.parse(response);
            //             $('#componentSpinner').hide();
            //             if (responseData && responseData.hasOwnProperty('result') && responseData.result.length > 0) {
            //                 $('#searchListView').hide();
            //                 $('#tableCompResult').show();
            //                 $('#tabCompBody').empty();
            //                 let searchList = responseData.result;
            //                 for (var item in searchList) {
            //                     var strToAdd = `<tr>
            //                                         <td class="first-cap">${searchList[item].ecosystem}</td>
            //                                         <td><a class="comp-name" href="#"
            //                                                 data-ecosystem=${searchList[item].ecosystem}
            //                                                 data-component=${searchList[item].name}
            //                                                 data-version=${searchList[item].version}>
            //                                             ${searchList[item].name}</a></td>
            //                                         <td>${searchList[item].version}</td>
            //                                     </tr>`
            //                     $('#tabCompBody').append(strToAdd);
            //                 }
            //             } else {
            //                 $('#tableCompResult').hide();
            //                 $('#searchListView').show();
            //                 $('#searchListView').html('');
            //                 let strToAdd = `<div class="list-view-pf-main-info">
            //                   <div class="list-view-pf-left">
            //                     <span class="pficon pficon-warning-triangle-o"></span>
            //                   </div>
            //                   <div class="list-view-pf-body">
            //                     <div class="list-view-pf-description">
            //                       <div class="list-group-item-text">
            //                        <b>We don't have any matching result.</b> Try something else!
            //                       </div>
            //                     </div>
            //                   </div>
            //                 </div>`;
            //                 $('#searchListView').append(strToAdd);
            //             }
            //         },
            //         error: () => {
            //             $('#componentSpinner').hide();
            //             $('#compGridCntr').hide();
            //             alert("Failure");
            //         }
            //     });
            //     event.preventDefault();
            // });
            $("#componentanalysesform-1").submit((val: any) => {

                event.preventDefault();
            });
        }

}