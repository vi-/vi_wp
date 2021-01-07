const responsiveHelper = () => {
  const helper = document.createElement( 'div' );
  helper.classList.add( 'resp-indicator' );
  document.body.prepend( helper )
}

if (process.env.NODE_ENV === 'development') {
  responsiveHelper()
}