CKEDITOR.replace('editor1', {
    contentsCss: [
      'https://fonts.googleapis.com/css?family=Georgia',
      'data:text/css,' + encodeURIComponent(`
        body {
          font-family: 'Georgia', serif;
          color: #333;
        }
  
        h1 {
          color: darkblue;
          font-size: 28px;
        }
  
        strong {
          color: red;
        }
  
        p {
          line-height: 1.6;
        }
      `)
    ]
  });
