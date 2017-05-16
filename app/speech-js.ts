interface WindowInterface extends Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
}
export class SpeechJs {
    private commands : any;
    private result: any;
    private recognition: any;

    constructor() {
        this.commands = {
            'clear': '_clearFunction',
            'search for': '_submitFunction',
            'searching for': '_submitFunction',
            'look for': '_submitFunction',
            'looking for': '_submitFunction',
            'upload': '_fileUpload'
        };
        const {SpeechRecognition}: WindowInterface = <WindowInterface> window;
        const {webkitSpeechRecognition}: WindowInterface = <WindowInterface> window;
        const {mozSpeechRecognition}: WindowInterface = <WindowInterface> window;
        this.result = document.getElementById('component');
        this.recognition = new (webkitSpeechRecognition || mozSpeechRecognition || SpeechRecognition)();
        this._handleSpeech();
        this._handleEvents();
    }

    private _handleEvents(): void {
        document.getElementById('start').addEventListener('click', (event: any) => {
            event.preventDefault();
            this._start();
            return false;
        });
    }

    private _handleCases(keyword: string): void {
        switch(keyword.toLowerCase()) {
            case 'clear':
                this._clearFunction();
                break;
            case 'search for':
            case 'look for':
            case 'looking for':
            case 'searching for':
                this._submitFunction(keyword);
                break;
            case 'upload':
                this._fileUpload();
                break;
        }
    }


    _fileUpload(): void {
        console.log('File');
        console.log(event);
        let file: HTMLElement = document.getElementById('stackAnalysesFile');
        if (file) {
            console.log(file);
            file.click();
        }
    }
    _clearFunction(): void {
        this.result.value = '';
    }
    _submitFunction(keyword: string): void {
        let e: any = event;
        for (let i: number = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
                let text: string = (e.results[i][0].transcript);
                text = text.toLowerCase();
                let packageName: string = text.split(keyword)[1].trim();
                if (packageName.indexOf(' ')) {
                    packageName = packageName.split(' ').join('');
                }
                this.result.value = packageName && packageName.trim();
                document.getElementById('stackbtn').click();
            }
        }
        // document.getElementById('stackbtn').click();
    }
        
    _handleSpeech(): void {
        console.log('Here');
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = true;
        this.recognition.continuous = false;
        this.recognition.maxAlternatives = 5;

        this.recognition.onresult = ((event: any) => {
            for (let i: number = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    let text = (event.results[i][0].transcript);
                    console.log(text);

                    // this.result.value += (event.results[i][0].transcript);

                    for (let key in this.commands) {
                        if (text.indexOf(key) !== -1) {
                            this._handleCases(key);
                        }
                    }
                }
                //console.log(event.results[i]);
                //result.innerHTML += (event.results[i][0].transcript);
            }
        });

        this.recognition.onend = ((event: any) => {
            //this._start();
            $('#start').css('color','#ccc');
        });

        // var grammar = '#JSGF V1.0; grammar colors; public <color> = aqua | azure | beige ... ;'
        //var this.recognition = new SpeechRecognition();
        // var speechRecognitionList = new SpeechGrammarList();
        // speechRecognitionList.addFromString(grammar, 1);
        // this.recognition.grammars = speechRecognitionList;

        /*[
        'onaudiostart',
        'onaudioend',
        'onend',
        'onerror',
        'onnomatch',
        'onresult',
        'onsoundstart',
        'onsoundend',
        'onspeechend',
        'onstart'
        ].forEach(function(eventName) {
            this.recognition[eventName] = function(e) {
                console.log(eventName, e);
            };
        });*/
    }
    _start(): void {
        this.recognition.start();
        $('#start').css('color','red');
    }
}