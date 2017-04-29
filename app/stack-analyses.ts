import { addToast, ApiLocator } from './index';

export class StackAnalyses {

    private stackapiUrl: string;
    private api: ApiLocator = new ApiLocator();
    private stackID: string;
    private similarStacks: any;
    private recommendations: any;
    private dependencies: any;
    private token: string;
    private cvssScale: any;
    private keys: any;
    private headers: any;


    constructor() {
        this.stackapiUrl = this
            .api
            .buildApiUrl(STACK_API_URL, 'recommender.api', 'api/v1');
    }

    buildStackAnalyses = (authToken: string) => {
        $('#pomTextConetntArea').show();
        $('#pomStatusSuccess').hide();
        $('#stackReportCntr').hide();
        $('#stackSpinner').hide();
        this.token = authToken;
        $('#stackAnalysesAnchor').on('click', () => {
            this.callStackAnalysesReportApi();
        });
        $('#stackAnalysesFileUpload').on('click', () => {
            this.uploadStackAnalysesFile();
        });
        $('#stackAnalysesFile').on('change', () => {
            this.updateFileList();
        });
    }

    callStackAnalysesReportApi = () => {
        event.preventDefault();
        $('#stackSpinner').show();
        $.ajax({
            url: this.stackapiUrl + 'stack-analyses/' + this.stackID,
            method: 'GET',
            //headers: { "Authorization": 'Bearer ' + this.token},
            dataType: 'json',
            success: response => {
                if (response.hasOwnProperty('error')) {
                    $('#stackSpinner').hide();
                    $('#stackReportCntr').hide();
                    addToast("alert-warning", "Your stack analyses is currently in progress.");
                } else {
                    $('#stackSpinner').hide();
                    $('#stackReportCntr').show();
                    this.formRecommendationList(response)
                }
            },
            error: () => {
                $('#stackSpinner').hide();
                console.log('Error calling stack report API')
            }
        });
    }

    formRecommendationList = (stackAnalysesData: any) => {
        if (stackAnalysesData.hasOwnProperty('recommendation')) {
            let recommendation: any = stackAnalysesData.recommendation.recommendations;
            let dependencies: any = stackAnalysesData.components;
            if (recommendation && recommendation.hasOwnProperty('similar_stacks') && recommendation.similar_stacks.length > 0 &&
                (recommendation.similar_stacks[0].analysis.missing_packages.length > 0 || recommendation.similar_stacks[0].analysis.version_mismatch.length > 0)) {
                this.similarStacks = recommendation.similar_stacks;
                const analysis: any = this.similarStacks[0].analysis;
                let missingPackages: Array<any> = analysis.missing_packages;
                let versionMismatch: Array<any> = analysis.version_mismatch;

                // Call the recommendations with the missing packages and version mismatches
                this.setRecommendations(missingPackages, versionMismatch);
            } else {
                $('#recommenderListView').html('');
                let strToAdd = `<div class="list-view-pf-main-info">
                          <div class="list-view-pf-left">
                            <span class="pficon pficon-ok"></span>
                          </div>
                          <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                              <div class="list-group-item-text">
                               <b>No recommendations.</b> Below is some general information about it.
                              </div>
                            </div>
                          </div>
                        </div>`;
                $('#recommenderListView').append(strToAdd);
            }

            // Check if the data has results key
            if (stackAnalysesData.hasOwnProperty('result') && stackAnalysesData.result.length > 0) {
                let result: any = stackAnalysesData.result[0];
                if (result.hasOwnProperty('components')) {
                    let components: Array<any> = result.components;
                    // Call the stack-components with the components information so that
                    // It can parse the necessary information and show relevant things.
                    if (components.length > 0) {
                         $('#dependenciesListView').show();
                         $('#dependenciesListViewHdr').show();
                        this.buildDependenciesUI(components);
                    }else{
                        $('#dependenciesListViewHdr').hide();
                        $('#dependenciesListView').hide();
                    }
                }
            }
        }
    }


    private getCvssObj(score: any) {
        if (score) {
            var iconClass = this.cvssScale.medium.iconClass;
            var displayClass = this.cvssScale.medium.displayClass;
            if (score >= this.cvssScale.high.start) {
                iconClass = this.cvssScale.high.iconClass;
                displayClass = this.cvssScale.high.displayClass;
            }
            return {
                iconClass: iconClass,
                displayClass: displayClass,
                value: score,
                percentScore: (score / 10 * 100)
            };
        }
    }

    private getCveId(security: any) {
        if (security && security.vulnerabilities && security.vulnerabilities[0].id) {
            return security.vulnerabilities[0].id;
        } else {
            return 'NA';
        }
    }

    private getCvssString(security: any) {
        if (security && security.vulnerabilities && security.vulnerabilities[0].cvss) {
            var cvssValue = parseFloat(security.vulnerabilities[0].cvss);
            return this.getCvssObj(cvssValue);
        } else {
            return {
                value: 'NA'
            };
        }
    }
    private buildDependenciesUI(dependencies: Array<any>): void {
        let length: number = dependencies.length;
        let dependencyTable: JQuery = $('#dependenciesTable');
        let tableHeader: JQuery = dependencyTable.find('thead');
        let tableBody: JQuery = dependencyTable.find('tbody');

        this.cvssScale = {
            low: {
                start: 0.0,
                end: 3.9,
                iconClass: 'warningCVE',
                displayClass: 'progress-bar-warning'
            },
            medium: {
                start: 4.0,
                end: 6.9,
                iconClass: 'warningCVE',
                displayClass: 'progress-bar-warning'
            },
            high: {
                start: 7.0,
                end: 10.0,
                iconClass: 'dangerCVE',
                displayClass: 'progress-bar-danger'
            }
        };

        this.keys = {
            name: 'name',
            currentVersion: 'curVersion',
            latestVersion: 'latestVersion',
            cveid: 'cveid',
            cvss: 'cvss',
            license: 'license',
            linesOfCode: 'linesOfCode',
            avgCycloComplexity: 'avgCycloComplexity',
            noOfFiles: 'noOfFiles',
            dateAdded: 'dateAdded',
            publicPopularity: 'pubPopularity',
            enterpriseUsage: 'enterpriseUsage',
            teamUsage: 'teamUsage'
        };

        this.headers = [
            {
                name: 'Name',
                identifier: this.keys['name'],
                isSortable: true
            }, {
                name: 'Current Version',
                identifier: this.keys['currentVersion'],
                isSortable: true
            }, {
                name: 'Latest Version',
                identifier: this.keys['latestVersion']
            }, {
                name: 'CVE ID',
                identifier: this.keys['cveid']
            }, {
                name: 'CVSS',
                identifier: this.keys['cvss']
            }, {
                name: 'License',
                identifier: this.keys['license']
            }, {
                name: 'Lines Of Code',
                identifier: this.keys['linesOfCode'],
                isSortable: true
            }, {
                name: 'Avgerage Cyclomatic Complexity',
                identifier: this.keys['avgCycloComplexity']
            }, {
                name: 'Total Files',
                identifier: this.keys['noOfFiles'],
                isSortable: true
            }
        ];


        let dependenciesList: Array<any> = [];
        let dependency: any, eachOne: any;
        $(tableBody).empty();
        $(tableHeader).empty();
        for (let i: number = 0; i < length; ++i) {
            dependency = {};
            eachOne = dependencies[i];
            let cycloMaticValue = eachOne['code_metrics']['average_cyclomatic_complexity'];
            dependency[this.keys['name']] = eachOne['name'];
            dependency[this.keys['currentVersion']] = eachOne['version'];
            dependency[this.keys['latestVersion']] = eachOne['latest_version'] || 'NA';
            dependency[this.keys['cveid']] = this.getCveId(eachOne['security']);
            dependency[this.keys['cvss']] = this.getCvssString(eachOne['security']);
            dependency[this.keys['license']] = eachOne['licenses'];
            dependency[this.keys['linesOfCode']] = eachOne['code_metrics']['code_lines'];

            dependency[this.keys['avgCycloComplexity']]
                = cycloMaticValue !== -1 ? cycloMaticValue : 'NA';
            dependency[this.keys['noOfFiles']] = eachOne['code_metrics']['total_files'];
            dependenciesList.push(dependency);
        }

        this.dependencies = {
            headers: this.headers,
            list: dependenciesList
        };
        let headerRow: JQuery = $('<tr />').appendTo(tableHeader);
        let strCvss = '';
        $.map(this.dependencies.headers, (key, value) => {
            $(`<th>${key.name}</th>`).appendTo(headerRow);
        });
        $.map(this.dependencies.list, (key, value) => {
            let bodyRow: JQuery = $('<tr />').appendTo(tableBody);
            bodyRow.append(`<td>${key.name}</td>`);
            bodyRow.append(`<td>${key.curVersion}</td>`);
            bodyRow.append(`<td>${key.latestVersion}</td>`);
            bodyRow.append(`<td>${key.cveid}</td>`);
            if (key.cvss.value !== 'NA') {
                strCvss = '<td><span data-toggle="tooltip" data-placement="top">' +
                    '<img class="dependencies-cve-icon" src="../assets/images/' + key.cvss.iconClass + '.png"></img>' +
                    key.cvss.value
                    + '</span></td>';
            } else {
                strCvss = '<td><span>' +
                    key.cvss.value
                    + '</span></td>';
            }
            bodyRow.append(strCvss);
            bodyRow.append('<td>' + key.license + '</td>');
            bodyRow.append('<td>' + key.linesOfCode + '</td>');
            bodyRow.append('<td>' + key.avgCycloComplexity + '</td>');
            bodyRow.append('<td>' + key.noOfFiles + '</td>');

        });
    }

    setRecommendations = (missing: any, version: any) => {
        this.recommendations = [];
        for (let i in missing) {
            if (missing.hasOwnProperty(i)) {
                let key: any = Object.keys(missing[i]);
                let value: any;
                this.recommendations.push({
                    suggestion: 'Recommended',
                    action: 'Add',
                    message: key[0] + ' ' + missing[i][key[0]]
                });
            }
        }

        for (let i in version) {
            if (version.hasOwnProperty(i)) {
                let key: any = Object.keys(version[i]);
                let value: any;
                this.recommendations.push({
                    suggestion: 'Recommended',
                    action: 'Upgrade',
                    message: key[0] + ' ' + version[i][key[0]]
                });
            }
        }
        this.constructRecommenderUI(this.recommendations)
    }

    constructRecommenderUI = (recommendations: any) => {
        $('#recommenderListView').html('');
        for (var i in recommendations) {
            var strToAdd = `<div class="list-view-pf-main-info">
                          <div class="list-view-pf-left">
                            <span class="pficon pficon-info"></span>
                          </div>
                          <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                              <div class="list-group-item-text">
                                ${recommendations[i].suggestion} - ${recommendations[i].action} ${recommendations[i].message}
                              </div>
                            </div>
                          </div>
                        </div>`;
            $('#recommenderListView').append(strToAdd);
        }
    }

    updateFileList = () => {
        var input = <HTMLInputElement>document.getElementById('stackAnalysesFile');
        var output = document.getElementById('fileList');
        for (var i = 0; i < input.files.length; ++i) {
            output.innerHTML = '<span>' + input.files.item(i).name + '</span>';
        }
    }

    uploadStackAnalysesFile = () => {
        let data = new FormData();
        $.each((<HTMLInputElement>document.getElementById('stackAnalysesFile')).files, function (key: any, value: any) {
            data.append('manifest[]', value);
        });
        $('#stackSpinner').show();
        $.ajax({
            url: this.stackapiUrl + 'stack-analyses',
            type: 'POST',
            data: data,
            //headers: { "Authorization": 'Bearer ' + this.token},
            cache: false,
            contentType: false,
            processData: false,
            success: data => {
                if (typeof data.error === 'undefined') {
                    $('#stackSpinner').hide();
                    addToast("alert-success", "Your stack analyses request has been successfully initiated.");
                    $('#pomStatusSuccess').show();
                    this.stackID = data.id;
                }
                else {
                    $('#stackSpinner').hide();
                    console.log('ERRORS: ' + data.error);
                }
            },
            error: () => {
                $('#stackSpinner').hide();
                console.log('ERRORS: ');
            }
        });
    }

}
