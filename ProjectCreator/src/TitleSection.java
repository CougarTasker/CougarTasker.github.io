import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class TitleSection extends Section{
  private JTextField input = null;
  public TitleSection(AR it) {
    super(it);

  }

  @Override
  JComponent getContents() {
    PlaceholderTextField input = new PlaceholderTextField();
    input.setPlaceholder("Title");
    input.setToolTipText("Title");
    return input;
  }

  public TitleSection() {

  }

  @Override
  public JButton getAddButton(AR it) {
    JButton out = new JButton("add title");
    out.addActionListener(new ActionListener() {
      @Override
      public void actionPerformed(ActionEvent e) {
        it.add(new TitleSection(it));
      }
    });
    return out;
  }


}
