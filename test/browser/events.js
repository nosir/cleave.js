describe('Custom input field', function () {
	var field = document.querySelector('.input-custom');

	it('should fire onchange event when value is set', function (done) {
		var cleave = new Cleave(field, {
				blocks: [3, 3, 3]
		});

		this.timeout(1000);
		field.addEventListener("change", function(){
			assert.equal(field.value, '123 456 789');
			done();
		});

		cleave.setRawValue('123456789');
	});

});