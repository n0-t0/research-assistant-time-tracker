from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'
    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route('/records', methods=['GET'])
    def get_records():
        records = Record.query.all()
        return jsonify([record.to_dict() for record in records])

    @app.route('/record/<int:id>', methods=['GET'])
    def get_record(id):
        record = Record.query.get_or_404(id)
        return jsonify(record.to_dict())

    @app.route('/record', methods=['POST'])
    def create_record():
        data = request.get_json()
        record = Record(
            start_time=datetime.fromisoformat(data['start_time']),
            end_time=datetime.fromisoformat(data['end_time']),
            excluded_hours=data['excluded_hours'],
            description=data['description']
        )
        db.session.add(record)
        db.session.commit()
        return jsonify(record.to_dict())

    @app.route('/record/<int:id>', methods=['PUT'])
    def update_record(id):
        data = request.get_json()
        record = Record.query.get_or_404(id)
        record.start_time = datetime.fromisoformat(data['start_time'])
        record.end_time = datetime.fromisoformat(data['end_time'])
        record.excluded_hours = data['excluded_hours']
        record.description = data['description']
        db.session.commit()
        return jsonify(record.to_dict())

    @app.route('/record/<int:id>', methods=['DELETE'])
    def delete_record(id):
        record = Record.query.get_or_404(id)
        db.session.delete(record)
        db.session.commit()
        return jsonify({"message": "delete success"})

    return app


class Record(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    excluded_hours = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'excluded_hours': self.excluded_hours,
            'description': self.description
        }


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0')
